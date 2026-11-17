"""
Fragrance storage.
"""

import os
from typing import Protocol, TypedDict, cast

import monday_code
from monday_code.exceptions import NotFoundException

from app.schemas.fragrance import Fragrance

KEY_PREFIX = "fragrance:"


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
        return Fragrance.model_validate(res.value) if res and res.value else None

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

    def __init__(self) -> None:
        self.data: dict[str, Fragrance] = {}

    async def get(self, fragrance_id: str) -> Fragrance | None:
        return self.data.get(fragrance_id)

    async def list(self) -> list[Fragrance]:
        return list(self.data.values())

    async def save(self, fragrance: Fragrance) -> None:
        self.data[fragrance.id] = fragrance

    async def delete(self, fragrance_id: str) -> None:
        _ = self.data.pop(fragrance_id, None)


def get_store() -> FragranceStore:
    return MondayFragranceStore(os.environ["MONDAY_ACCESS_TOKEN"])
