from typing import Annotated

import jwt
from fastapi import Header, HTTPException, status
from pydantic import BaseModel

from app.core.settings import settings


class Session(BaseModel):
    account_id: int
    user_id: int


def decode_session(token: str) -> Session:
    try:
        payload = jwt.decode(
            token.removeprefix("Bearer ").strip(),
            settings.monday_client_secret.get_secret_value(),
            algorithms=["HS256"],
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid session") from exc
    return Session.model_validate(payload["dat"])


def get_session(authorization: Annotated[str | None, Header()] = None) -> Session:
    if not authorization:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing session")
    return decode_session(authorization)
