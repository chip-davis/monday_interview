import monday_code

from app.core.settings import settings


async def load_client_secret() -> str:
    if settings.monday_client_secret is not None:
        return settings.monday_client_secret.get_secret_value()
    async with monday_code.ApiClient(monday_code.Configuration()) as client:
        return await monday_code.SecretsApi(client).get_secret("MONDAY_CLIENT_SECRET")
