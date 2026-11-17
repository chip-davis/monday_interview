from fastapi import FastAPI
from fastapi.routing import APIRoute

from app.api.fragrances import router as fragrances_router


def _operation_id(route: APIRoute) -> str:
    return route.name

app = FastAPI(generate_unique_id_function=_operation_id)
app.include_router(fragrances_router)
