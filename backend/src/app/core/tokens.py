import logging

import monday_code
from monday_code.exceptions import NotFoundException
from monday_code.models.json_data_contract import JsonDataContract
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class _StoredToken(BaseModel):
    access_token: str


def _key(account_id: int) -> str:
    return f"oauth:{account_id}"


async def get_account_token(account_id: int) -> str | None:
    async with monday_code.ApiClient(monday_code.Configuration()) as client:
        try:
            res = await monday_code.SecureStorageApi(client).get_secure_storage(
                _key(account_id)
            )
        except NotFoundException:
            logger.info("no oauth token stored for account %s", account_id)
            return None
    value: object = res.value if res else None
    return _StoredToken.model_validate(value).access_token if value else None


async def save_account_token(account_id: int, access_token: str) -> None:
    async with monday_code.ApiClient(monday_code.Configuration()) as client:
        _ = await monday_code.SecureStorageApi(client).put_secure_storage(
            _key(account_id), JsonDataContract(value={"access_token": access_token})
        )
    logger.info("stored oauth token for account %s", account_id)
