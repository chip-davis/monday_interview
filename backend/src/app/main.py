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

STATIC_DIR = Path("static")


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

if STATIC_DIR.is_dir():
    app.mount("/", SPAStaticFiles(directory=STATIC_DIR, html=True), name="frontend")
