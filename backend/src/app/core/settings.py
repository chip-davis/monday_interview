from typing import ClassVar, Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env", extra="ignore"
    )

    storage: Literal["monday", "memory"] = "monday"
    monday_client_id: str
    monday_client_secret: SecretStr


settings = Settings.model_validate({})
