# Time Manager

Full-stack application for tracking working hours.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy
- Database: SQLite by default (`DATABASE_URL`), ready to switch to PostgreSQL later

## Project structure

```text
time-manager/
├─ backend/app/
│  ├─ config.py              # centralized env/config
│  ├─ db/                    # SQLAlchemy engine/session/base
│  ├─ models/                # ORM models
│  ├─ schemas/               # API DTOs split by domain + shared validators
│  ├─ services/              # business logic (retention, entries, bootstrap)
│  ├─ routers/               # FastAPI routers by domain
│  └─ main.py                # app composition/startup
└─ frontend/src/
   ├─ components/            # UI components
   ├─ lib/                   # utility modules (theme/time)
   ├─ api.ts                 # API client
   ├─ i18n.ts                # translations
   ├─ types.ts               # shared frontend types
   └─ App.tsx                # page composition/state orchestration
```

## Features

- Start / Stop timer
- Multiple sessions per day
- Separate Home / History / Settings pages
- Swipe between Home and History
- Manual day override
- Day statuses and notes
- Filters for 1 / 3 / 6 months
- Automatic cleanup of data older than 6 months
- Language switcher: Ukrainian / English
- Theme modes: Light / Dark / System / Custom
- Custom theme colors via HEX
- Backend architecture ready for multi-user

## Notes

The app uses a demo user with `id=1` on first run so you can start immediately without authentication.
API also supports `X-User-Id` header for switching user context in development.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed module responsibilities and request flow.
See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and PR checklist.
