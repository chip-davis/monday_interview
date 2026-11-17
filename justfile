set shell := ["bash", "-cu"]

default:
    @just --list

install: install-backend install-frontend

[working-directory: 'backend']
install-backend:
    uv sync

[working-directory: 'frontend']
install-frontend:
    npm install

[parallel]
dev: dev-backend dev-frontend

[working-directory: 'backend']
dev-backend:
    uv run fastapi dev src/app/main.py

[working-directory: 'frontend']
dev-frontend:
    npm run dev

[working-directory: 'frontend']
build:
    npm run build

check: check-backend check-frontend

[working-directory: 'backend']
check-backend:
    uv run ruff check src
    uv run ruff format --check src
    uvx basedpyright src

[working-directory: 'frontend']
check-frontend:
    npm run lint
    npx tsc -b

[working-directory: 'backend']
fmt:
    uv run ruff check --fix src
    uv run ruff format src

gen:
    cd backend && uv run python -c "import json; from app.main import app; print(json.dumps(app.openapi(), indent=2))" > ../frontend/openapi.json
    cd frontend && npm run gen:api
