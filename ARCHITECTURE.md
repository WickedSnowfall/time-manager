# Architecture Overview

## Backend

### Layers

- `config.py`: single source of truth for runtime configuration from environment.
- `db/`: SQLAlchemy engine/session/base setup.
- `models/`: ORM entities (`User`, `WorkSession`, `DayEntry`, `UserPreference`).
- `schemas/`: request/response DTOs for FastAPI routes.
  - `common.py`: shared API types (`Status`, `ThemeMode`, `HexColor`).
  - `sessions.py`: session API responses.
  - `entries.py`: entry payloads/responses + override validation.
  - `preferences.py`: preference payloads/responses.
- `services/`: business rules (bootstrap demo user, retention cleanup, day recalculation).
  - `sessions_service.py`: active session lookup/start/stop and elapsed calculation.
  - `entries_service.py`: day entries listing/update mapping to API shape.
  - `preferences_service.py`: get/create/update preference entity and API mapping.
- `time.py`: centralized UTC timestamp helper for consistent non-deprecated datetime handling.
- `routers/`: HTTP endpoints grouped by domain (`sessions`, `entries`, `preferences`).
- `main.py`: application composition, CORS setup, router registration, startup bootstrap.

### Request flow

1. Router receives request and validates payload via schemas.
2. Router gets `db` session + `get_active_user_id` dependency.
   - resolves `X-User-Id`
   - ensures user + default preferences exist
   - runs retention cleanup for that user
3. Service layer performs business logic/query mutations.
4. Router returns schema response.

## Frontend

### Modules

- `types.ts`: shared domain/frontend types.
- `i18n.ts`: dictionaries and helper labels by language.
- `api.ts`: all HTTP operations to backend.
- `lib/theme.ts`: theme defaults, HEX sanitization, CSS variable application.
- `lib/time.ts`: date/time formatting helpers.
- `components/`: presentational and form-focused units (`SettingsPage`, `EditEntryModal`).
- `App.tsx`: orchestration layer (screen state, data loading, side effects).

### UI flow

1. App loads active session + preferences.
2. History entries load by selected period.
3. Session start/stop updates backend and refreshes active state + entries.
4. Settings updates local state, then persists via API and reapplies theme variables.

## Design decisions

- Keep one active session at a time, but allow multiple completed sessions per day.
- Aggregate worked time per day from all completed sessions.
- Sanitize custom HEX colors before applying/saving to avoid invalid CSS/API payloads.
- Keep configuration centralized to avoid duplicated constants across modules.
