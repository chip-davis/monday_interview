from pathlib import Path

from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles

from app.api.fragrances import router as fragrances_router

STATIC_DIR = Path("static")


def _operation_id(route: APIRoute) -> str:
    return route.name


app = FastAPI(generate_unique_id_function=_operation_id)
app.include_router(fragrances_router, prefix="/api")

if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
