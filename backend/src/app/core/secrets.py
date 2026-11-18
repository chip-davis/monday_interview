import logging

import monday_code

from app.core.settings import settings

logger = logging.getLogger(__name__)


async def load_client_secret() -> str:
    if settings.monday_client_secret is not None:
        return settings.monday_client_secret.get_secret_value()
    try:
        async with monday_code.ApiClient(monday_code.Configuration()) as client:
            return await monday_code.SecretsApi(client).get_secret(
                "MONDAY_CLIENT_SECRET"
            )
    except Exception:
        logger.exception("could not read MONDAY_CLIENT_SECRET from monday code secrets")
        raise
