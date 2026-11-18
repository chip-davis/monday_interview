"""
Fragrance storage.
"""

import logging
from collections.abc import Iterable
from typing import Annotated, Protocol, TypedDict, cast

import monday_code
from fastapi import Depends, status
from fastapi.exceptions import HTTPException
from monday_code.exceptions import NotFoundException

from app.core.auth import Session, get_session
from app.core.settings import settings
from app.core.tokens import get_account_token
from app.schemas.fragrance import Fragrance

KEY_PREFIX = "fragrance:"

logger = logging.getLogger(__name__)


class _SearchRecord(TypedDict):
    key: str
    value: dict[str, object]


class _SearchResponse(TypedDict, total=False):
    records: list[_SearchRecord]
    cursor: str | None


class FragranceStore(Protocol):
    async def get(self, fragrance_id: str) -> Fragrance | None: ...
    async def list(self) -> list[Fragrance]: ...
    async def save(self, fragrance: Fragrance) -> None: ...
    async def delete(self, fragrance_id: str) -> None: ...


class MondayFragranceStore:
    """monday code key/value storage. One key per fragrance: `fragrance:<id>`."""

    def __init__(self, access_token: str) -> None:
        self.token: str = access_token
        self.config: monday_code.Configuration = monday_code.Configuration()

    async def get(self, fragrance_id: str) -> Fragrance | None:
        async with monday_code.ApiClient(self.config) as client:
            try:
                res = await monday_code.StorageApi(client).get_by_key_from_storage(
                    KEY_PREFIX + fragrance_id,
                    shared=False,
                    x_monday_access_token=self.token,
                )
            except NotFoundException:
                return None
        value: object = res.value if res else None
        return Fragrance.model_validate(value) if value else None

    async def list(self) -> list[Fragrance]:
        fragrances: list[Fragrance] = []
        cursor: str | None = None
        async with monday_code.ApiClient(self.config) as client:
            api = monday_code.StorageApi(client)
            while True:
                res = await api.search_record(
                    KEY_PREFIX, x_monday_access_token=self.token, cursor=cursor
                )
                res = cast(_SearchResponse, res or {})
                fragrances += [
                    Fragrance.model_validate(r["value"]) for r in res.get("records", [])
                ]
                cursor = res.get("cursor")
                if not cursor:
                    return fragrances

    async def save(self, fragrance: Fragrance) -> None:
        async with monday_code.ApiClient(self.config) as client:
            _ = await monday_code.StorageApi(client).upsert_by_key_from_storage(
                key=KEY_PREFIX + fragrance.id,
                x_monday_access_token=self.token,
                json_data_contract=monday_code.JsonDataContract(
                    value=fragrance.model_dump(mode="json")
                ),
            )

    async def delete(self, fragrance_id: str) -> None:
        async with monday_code.ApiClient(self.config) as client:
            await monday_code.StorageApi(client).delete_by_key_from_storage(
                KEY_PREFIX + fragrance_id, x_monday_access_token=self.token
            )


class InMemoryFragranceStore:
    """Dict-backed store for local dev and tests"""

    def __init__(self, seed: Iterable[Fragrance] = ()) -> None:
        self.data: dict[str, Fragrance] = {f.id: f for f in seed}

    async def get(self, fragrance_id: str) -> Fragrance | None:
        return self.data.get(fragrance_id)

    async def list(self) -> list[Fragrance]:
        return list(self.data.values())

    async def save(self, fragrance: Fragrance) -> None:
        self.data[fragrance.id] = fragrance

    async def delete(self, fragrance_id: str) -> None:
        _ = self.data.pop(fragrance_id, None)


from app.core.seed import SAMPLE_FRAGRANCES

_memory_store = InMemoryFragranceStore(SAMPLE_FRAGRANCES)


async def get_store(
    session: Annotated[Session, Depends(get_session)],
) -> FragranceStore:
    if settings.storage == "memory":
        return _memory_store
    token = await get_account_token(session.account_id)
    if token is None:
        logger.info("account %s has not connected yet", session.account_id)
        raise HTTPException(status.HTTP_403_FORBIDDEN, "oauth_required")
    return MondayFragranceStore(token)
