from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class FragranceCreate(BaseModel):
    name: str
    description: str
    category: str
    image_url: str
    recipe: str = ""


class FragranceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    recipe: str = ""


class Fragrance(FragranceCreate):
    id: str
    created_at: datetime
    updated_at: datetime
