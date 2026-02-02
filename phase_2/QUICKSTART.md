# Quick Start Guide - No Docker

Get the app running in 5 minutes without Docker.

## One-Time Setup

### Step 1: Install PostgreSQL (2 minutes)

**macOS:**
```bash
brew install postgresql@15 && brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql && sudo systemctl start postgresql
```

**Windows:** Download from https://www.postgresql.org/download/windows/

### Step 2: Create Database (1 minute)

```bash
psql -U postgres -c "CREATE DATABASE phase2_todo_dev;"
```

### Step 3: Install Python Dependencies (2 minutes)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 4: Install Frontend Dependencies (1 minute)

```bash
cd frontend
npm install
```

## Daily Usage - Start Both Servers

### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

Wait for:
```
Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Wait for:
```
- ready started server on 0.0.0.0:3000
```

## Test It Works

1. Open http://localhost:3000 in browser
2. Register: `test@example.com` / `Password123`
3. Should see dashboard ✅

## Key Files Changed

- ✅ `.env.local` - Updated to use `localhost` instead of Docker
- ✅ `backend/requirements.txt` - Created with all dependencies
- ✅ `backend/src/config.py` - Already uses environment variables
- ✅ `backend/src/db/engine.py` - Updated for local PostgreSQL
- ✅ `backend/src/main.py` - CORS optimized for localhost
- ✅ `backend/src/api/v1/auth.py` - Cookies use `samesite=lax`
- ✅ Docker files deleted (docker-compose.yml, Dockerfile)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PostgreSQL not found | Install via `brew install postgresql` (macOS) or `apt-get install postgresql` (Linux) |
| `psycopg2.OperationalError` | Run `psql -U postgres -c "CREATE DATABASE phase2_todo_dev;"` |
| Port 8000 in use | Kill with `lsof -i :8000 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| Frontend can't connect | Ensure backend is running and check `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` |

## Full Documentation

See `backend/LOCAL_SETUP.md` for detailed setup instructions.

## What's Different from Docker

| Feature | Docker | Local |
|---------|--------|-------|
| Database Host | `db` service | `localhost` |
| Database Port | `5432` (internal) | `5432` (external) |
| SSL Required | Neon (optional) | No (local) |
| Startup Time | 30+ seconds | 3-5 seconds |
| Memory Usage | 500MB+ | 100-200MB |
| Configuration | Environment vars | Same (`.env.local`) |

## Next Steps

- ✅ Both servers running
- Create your first task via API
- Implement new features
- Run tests
- Deploy to production

Happy coding! 🚀
