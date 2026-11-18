import logging
from pathlib import Path
from typing import override

from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException
from starlette.responses import Response
from starlette.types import Scope

from app.api.fragrances import router as fragrances_router
from app.api.oauth import router as oauth_router
from app.core.settings import settings

STATIC_DIR = Path("static")

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


class _RedactOAuthQuery(logging.Filter):
    @override
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.args, tuple) and len(record.args) > 2:
            path = record.args[2]
            if isinstance(path, str) and path.startswith("/api/oauth/"):
                record.args = (*record.args[:2], path.split("?")[0], *record.args[3:])
        return True


logging.getLogger("uvicorn.access").addFilter(_RedactOAuthQuery())
for noisy in ("httpx", "httpx2"):
    logging.getLogger(noisy).setLevel(logging.WARNING)


class SPAStaticFiles(StaticFiles):
    @override
    async def get_response(self, path: str, scope: Scope) -> Response:
        try:
            return await super().get_response(path, scope)
        except HTTPException as exc:
            if exc.status_code != 404 or path.startswith("api") or Path(path).suffix:
                raise
            return await super().get_response("index.html", scope)


def _operation_id(route: APIRoute) -> str:
    return route.name


app = FastAPI(generate_unique_id_function=_operation_id)
app.include_router(fragrances_router, prefix="/api")
app.include_router(oauth_router, prefix="/api")

logger.info(
    "starting: storage=%s, frontend=%s",
    settings.storage,
    "static" if STATIC_DIR.is_dir() else "none",
)

if STATIC_DIR.is_dir():
    app.mount("/", SPAStaticFiles(directory=STATIC_DIR, html=True), name="frontend")
