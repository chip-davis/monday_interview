from typing import Literal, Self

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    storage: Literal["monday", "memory"] = "monday"
    monday_access_token: SecretStr | None = None

    @model_validator(mode="after")
    def _require_monday_token(self) -> Self:
        if self.storage == "monday" and self.monday_access_token is None:
            raise ValueError("MONDAY_ACCESS_TOKEN is required when STORAGE=monday")
        return self


settings = Settings()
