from __future__ import annotations

from pydantic import BaseModel


class Model(BaseModel):
    id: str
    description: str
    category: str
    created_at: str
    updated_at: str
    image_url: str
