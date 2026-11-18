# Candle Gift Box Production Builder

A monday.com app that turns candle gift box orders into items on the Production Orders board. Each box gets three different fragrances, chosen from a catalog the team manages in the app.

## Project layout

```
backend/
  src/app/
    main.py             FastAPI app; serves /api and the built frontend
    api/fragrances.py   Fragrance CRUD endpoints
    api/oauth.py        OAuth connect flow for monday Storage
    core/auth.py        Verifies monday session tokens
    core/storage.py     FragranceStore: monday Storage or in-memory
    core/tokens.py      Per-account OAuth tokens in SecureStorage
    core/secrets.py     Client secret from .env or monday code secrets
    core/settings.py    Env config
    schemas/            Pydantic models
  Procfile, .mondaycoderc, requirements.txt   monday code build config

frontend/
  src/
    router.tsx          Routes: /order and /fragrances
    OrderPage.tsx       Order view
    OrderForm.tsx       Step-by-step order form
    FragrancesPage.tsx  Fragrance view
    FragranceManager.tsx  Fragrance table and dialogs
    monday.ts           Creates the board item via the monday API
    api/fetcher.ts      Adds the session token to every API call
    api/gen/            Orval client generated from the OpenAPI schema

justfile    Dev, check, codegen and deploy recipes
mise.toml   Tool versions
```

## Flow

Both board views are one React app on a single monday code deployment, and FastAPI serves it alongside the API. Orders go straight to monday's GraphQL API from the browser. Fragrance calls go to our backend with monday's session token, and the backend reads and writes monday Storage using the account's OAuth token.

## Running locally

Run `mise install && just install`. Then create `backend/.env` with `STORAGE=memory`, `MONDAY_CLIENT_ID` and `MONDAY_CLIENT_SECRET`.

Start `just dev-backend` and `just dev-frontend`, and point a draft board view at `http://localhost:5173/order`. It only works inside monday, since every request needs a session token.
