import logging
from datetime import UTC, datetime
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.storage import FragranceStore, get_store
from app.schemas.fragrance import Fragrance, FragranceCreate, FragranceUpdate

router = APIRouter(prefix="/fragrances", tags=["fragrances"])
Store = Annotated[FragranceStore, Depends(get_store)]

logger = logging.getLogger(__name__)


async def _get_or_404(store: FragranceStore, fragrance_id: str) -> Fragrance:
    fragrance = await store.get(fragrance_id)
    if fragrance is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, f"Fragrance {fragrance_id} not found"
        )
    return fragrance


@router.get("")
async def list_fragrances(store: Store) -> list[Fragrance]:
    return await store.list()


@router.get("/{fragrance_id}")
async def get_fragrance(fragrance_id: str, store: Store) -> Fragrance:
    return await _get_or_404(store, fragrance_id)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_fragrance(body: FragranceCreate, store: Store) -> Fragrance:
    now = datetime.now(UTC)
    fragrance = Fragrance.model_validate(
        body.model_dump() | {"id": str(uuid4()), "created_at": now, "updated_at": now}
    )
    await store.save(fragrance)
    logger.info("created fragrance %s (%s)", fragrance.id, fragrance.name)
    return fragrance


@router.patch("/{fragrance_id}")
async def update_fragrance(
    fragrance_id: str, body: FragranceUpdate, store: Store
) -> Fragrance:
    current = await _get_or_404(store, fragrance_id)
    changes = body.model_dump(exclude_none=True)
    updated = current.model_copy(update={**changes, "updated_at": datetime.now(UTC)})
    await store.save(updated)
    logger.info("updated fragrance %s: %s", fragrance_id, sorted(changes))
    return updated


@router.delete("/{fragrance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fragrance(fragrance_id: str, store: Store) -> None:
    _ = await _get_or_404(store, fragrance_id)
    await store.delete(fragrance_id)
    logger.info("deleted fragrance %s", fragrance_id)
