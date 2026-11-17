from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class Fragrance(BaseModel):
    id: str
    name: str
    description: str
    category: str
    created_at: datetime
    updated_at: datetime
    image_url: str
