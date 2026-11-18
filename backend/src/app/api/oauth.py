from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

from app.core.auth import decode_session
from app.core.settings import settings
from app.core.tokens import save_account_token

router = APIRouter(prefix="/oauth", include_in_schema=False)

AUTHORIZE_URL = "https://auth.monday.com/oauth2/authorize"
TOKEN_URL = "https://auth.monday.com/oauth2/token"


class _State(BaseModel):
    account_id: int


class _TokenResponse(BaseModel):
    access_token: str


def _secret() -> str:
    return settings.monday_client_secret.get_secret_value()


@router.get("/start")
async def oauth_start(request: Request, token: str) -> RedirectResponse:
    session = decode_session(token)

    state = jwt.encode(
        {
            "account_id": session.account_id,
            "exp": datetime.now(UTC) + timedelta(minutes=10),
        },
        _secret(),
        algorithm="HS256",
    )
    params = {
        "client_id": settings.monday_client_id,
        "redirect_uri": str(request.url_for("oauth_callback")),
        "state": state,
    }

    return RedirectResponse(f"{AUTHORIZE_URL}?{urlencode(params)}")


@router.get("/callback")
async def oauth_callback(request: Request, code: str, state: str) -> HTMLResponse:
    try:
        account_id = _State.model_validate(
            jwt.decode(state, _secret(), algorithms=["HS256"])
        ).account_id
    except jwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "invalid state") from exc

    async with httpx.AsyncClient() as client:
        res = await client.post(
            TOKEN_URL,
            data={
                "client_id": settings.monday_client_id,
                "client_secret": _secret(),
                "code": code,
                "redirect_uri": str(request.url_for("oauth_callback")),
            },
        )
    _ = res.raise_for_status()
    token = _TokenResponse.model_validate_json(res.content)
    await save_account_token(account_id, token.access_token)
    return HTMLResponse(
        "<p>Connected. You can close this window.</p><script>window.close()</script>"
    )
