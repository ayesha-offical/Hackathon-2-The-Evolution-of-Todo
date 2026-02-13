# Local Development Setup (No Docker)

This project is now configured for pure local Python development without Docker.

## Prerequisites

### 1. PostgreSQL Installation

**macOS (Homebrew)**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian)**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows**
- Download from: https://www.postgresql.org/download/windows/
- Follow the installer and remember your postgres password

### 2. Verify PostgreSQL is Running

```bash
psql -U postgres -c "SELECT version();"
```

Should output PostgreSQL version info.

## Database Setup

### 1. Create Development Database

```bash
psql -U postgres
```

Then in the psql prompt:
```sql
CREATE DATABASE phase2_todo_dev;
\q
```

### 2. Verify Database Creation

```bash
psql -U postgres -d phase2_todo_dev -c "SELECT datname FROM pg_database WHERE datname = 'phase2_todo_dev';"
```

Should return: `phase2_todo_dev`

## Python Backend Setup

### 1. Create Virtual Environment

```bash
cd /home/ayeshafaisal/Hackaton_2/phase_2/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 3. Verify Installation

```bash
python -c "import fastapi; import sqlalchemy; print('✅ All dependencies installed')"
```

### 4. Configure Environment Variables

The `.env.local` file is already configured with:
- **Database**: `postgresql://postgres:postgres@localhost:5432/phase2_todo_dev`
- **API Port**: `8000`
- **Frontend URL**: `http://localhost:3000`

No changes needed unless you changed your PostgreSQL password.

## Running the Backend

### Start Backend Server

```bash
cd /home/ayeshafaisal/Hackaton_2/phase_2/backend
source venv/bin/activate
python main.py
```

Expected output:
```
Starting Phase 2 Todo API (Environment: development)
✅ Database initialized
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Verify Backend is Running

In another terminal:
```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status":"healthy","service":"phase2-todo-api","environment":"development","version":"1.0.0"}
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd /home/ayeshafaisal/Hackaton_2/phase_2/frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Expected output:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Full Stack Testing

### 1. Verify Both Services Running

**Terminal 1 - Backend:**
```bash
cd backend && source venv/bin/activate && python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

### 2. Test in Browser

1. Open http://localhost:3000
2. Click "Sign up" or "Login"
3. Create an account with:
   - Email: `test@example.com`
   - Password: `TestPassword12` (8+ characters)
4. Should see dashboard after login ✅

### 3. Verify Authentication Works

```bash
# Test registration
curl -X POST http://localhost:8000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword12"}'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword12"}' \
  -c /tmp/cookies.txt

# Test session check with cookies
curl -X GET http://localhost:8000/api/v1/auth/get-session \
  -b /tmp/cookies.txt
```

## Key Configuration Changes (No Docker)

### Database Configuration
- **Host**: `localhost` (not `db` Docker service)
- **Port**: `5432` (standard PostgreSQL port)
- **Database**: `phase2_todo_dev`
- **User**: `postgres`
- **Password**: `postgres`

### Auth Cookies
- **SameSite**: `lax` (local development standard)
- **Secure**: `false` (HTTP only, not HTTPS)
- **HttpOnly**: `true` (security best practice)
- **Domain**: Not set (auto-determined by browser)

### CORS
- **Allowed Origins**: `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`, `http://127.0.0.1:3001`
- **Allow Credentials**: `true` (for cookie-based auth)
- **Methods**: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- **Headers**: `Content-Type, Authorization`

## Troubleshooting

### PostgreSQL Connection Refused

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1;"

# If failed, start PostgreSQL
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
# Windows: Services > PostgreSQL > Start
```

### Port Already in Use

```bash
# Check what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
python main.py --port 9000
```

### Bcrypt/Passlib Errors

```bash
# Reinstall with compatible versions
pip uninstall bcrypt passlib
pip install bcrypt==4.1.3 passlib==1.7.4
```

### Database Connection Error

```bash
# Test database connection
psql -U postgres -d phase2_todo_dev

# If fails, create database
psql -U postgres
CREATE DATABASE phase2_todo_dev;
\q
```

### Frontend Not Connecting to Backend

1. Check backend is running on `http://localhost:8000`
2. Verify CORS is enabled: Check `src/main.py` `allowed_origins`
3. Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

## Performance Tips

1. **Python Startup**: First run takes ~3-5 seconds (normal for SQLAlchemy)
2. **Database Queries**: SQL queries logged in development mode (disable in config.py if too verbose)
3. **Async Operations**: Backend uses asyncpg for fast database queries
4. **Frontend HMR**: Next.js hot module replacement works automatically

## Next Steps

- Create your first task via the API
- Test authentication flow
- Build your features
- Run tests (when available)
- Deploy when ready

For production deployment, see `DEPLOYMENT.md` (coming soon).
