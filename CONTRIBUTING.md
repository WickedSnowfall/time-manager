# Contributing Guide

## Local setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Quality checks

Run before opening a PR:

```bash
cd backend
python -m unittest discover -s tests -p "test_*.py"
python -m compileall app tests
```

```bash
cd frontend
npm run build
```

## Architecture conventions

- Keep `routers/` thin: request validation + response mapping only.
- Keep business logic in `services/`.
- Keep persistence models in `models/`.
- Keep runtime config in `backend/app/config.py`.
- Use `get_active_user_id` dependency for user-scoped endpoints.
- For frontend:
  - API calls belong in `src/api.ts`.
  - Pure helpers belong in `src/lib/`.
  - UI blocks belong in `src/components/`.
  - `App.tsx` should orchestrate state and screen composition.

## PR checklist

- [ ] No duplicated logic introduced across layers.
- [ ] Names are domain-oriented and easy to grep.
- [ ] New behavior has a test (backend service/API at minimum).
- [ ] README / ARCHITECTURE / CONTRIBUTING updated if structure changed.
