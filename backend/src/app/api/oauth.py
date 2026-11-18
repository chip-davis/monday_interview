import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

from app.core.auth import ClientSecret, decode_session
from app.core.settings import settings
from app.core.tokens import save_account_token

router = APIRouter(prefix="/oauth", include_in_schema=False)

AUTHORIZE_URL = "https://auth.monday.com/oauth2/authorize"
TOKEN_URL = "https://auth.monday.com/oauth2/token"

logger = logging.getLogger(__name__)


class _State(BaseModel):
    account_id: int


class _TokenResponse(BaseModel):
    access_token: str


@router.get("/start")
async def oauth_start(
    request: Request, token: str, secret: ClientSecret
) -> RedirectResponse:
    session = decode_session(token, secret)

    state = jwt.encode(
        {
            "account_id": session.account_id,
            "exp": datetime.now(UTC) + timedelta(minutes=10),
        },
        secret,
        algorithm="HS256",
    )
    params = {
        "client_id": settings.monday_client_id,
        "redirect_uri": str(request.url_for("oauth_callback")),
        "state": state,
    }

    logger.info(
        "oauth start: account %s, user %s, redirect_uri %s",
        session.account_id,
        session.user_id,
        params["redirect_uri"],
    )
    return RedirectResponse(f"{AUTHORIZE_URL}?{urlencode(params)}")


@router.get("/callback")
async def oauth_callback(
    request: Request, code: str, state: str, secret: ClientSecret
) -> HTMLResponse:
    try:
        account_id = _State.model_validate(
            jwt.decode(state, secret, algorithms=["HS256"])
        ).account_id
    except jwt.PyJWTError as exc:
        logger.warning("oauth callback rejected: %r", exc)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "invalid state") from exc

    async with httpx.AsyncClient() as client:
        res = await client.post(
            TOKEN_URL,
            data={
                "client_id": settings.monday_client_id,
                "client_secret": secret,
                "code": code,
                "redirect_uri": str(request.url_for("oauth_callback")),
            },
        )
    if res.is_error:
        logger.error(
            "oauth token exchange failed for account %s: %s %s",
            account_id,
            res.status_code,
            res.text[:500],
        )
    _ = res.raise_for_status()
    token = _TokenResponse.model_validate_json(res.content)
    await save_account_token(account_id, token.access_token)
    logger.info("oauth connected: account %s", account_id)
    return HTMLResponse(
        "<p>Connected. You can close this window.</p><script>window.close()</script>"
    )
