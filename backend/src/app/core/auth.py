import logging
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel

from app.core.secrets import load_client_secret

logger = logging.getLogger(__name__)


class Session(BaseModel):
    account_id: int
    user_id: int


ClientSecret = Annotated[str, Depends(load_client_secret)]


def decode_session(token: str, secret: str) -> Session:
    try:
        payload = jwt.decode(
            token.removeprefix("Bearer ").strip(),
            secret,
            algorithms=["HS256"],
        )
    except jwt.PyJWTError as exc:
        logger.warning("session rejected: %r", exc)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid session") from exc
    return Session.model_validate(payload["dat"])


def get_session(
    secret: ClientSecret, authorization: Annotated[str | None, Header()] = None
) -> Session:
    if not authorization:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing session")
    return decode_session(authorization, secret)
