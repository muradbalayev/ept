# Maglev Digital Twin

React + FastAPI ile qurulmus maqnit asqili rutubet olcme qurugusunun digital twin demo sistemi.

## Backend

```powershell
cd C:\Users\user\Desktop\ept\maglev-digital-twin\backend
& "C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

## Frontend

```powershell
cd C:\Users\user\Desktop\ept\maglev-digital-twin\frontend
npm install
npm run dev
```

Dashboard: http://127.0.0.1:5173

If port `8000` is already busy, run the backend on another port:

```powershell
cd C:\Users\user\Desktop\ept\maglev-digital-twin\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8010
```

Then run the frontend with the same backend port:

```powershell
cd C:\Users\user\Desktop\ept\maglev-digital-twin\frontend
$env:VITE_BACKEND_PORT="8010"
npm run dev
```

## Test

```powershell
cd C:\Users\user\Desktop\ept\maglev-digital-twin\backend
.\.venv\Scripts\python.exe -m pytest
```

```powershell
cd C:\Users\user\Desktop\ept\maglev-digital-twin\frontend
npm run build
```

## Production deploy

Tövsiyə olunan arxitektura:

- Frontend: Vercel
- Backend: Railway, Render və ya Fly.io

Səbəb: Vercel statik React/Vite frontend üçün çox uyğundur, amma FastAPI WebSocket serveri davamlı bağlantı saxladığına görə ayrıca backend hostinqində işləməlidir.

### 1. Backend deploy

Railway üçün ən rahat variant bu repoda hazır olan `railway.json` faylından istifadə etməkdir.

Railway service ayarları:

- Root Directory: boş saxla və ya `/`
- Config File: `/railway.json`
- Custom Build Command: boş saxla
- Custom Start Command: boş saxla

`railway.json` özü bunu işlədir:

```json
{
  "build": {
    "buildCommand": "pip install -r backend/requirements.txt"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/api/health"
  }
}
```

Frontend deploy olandan sonra Railway backend environment variable əlavə et:

```text
CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

Backend URL nümunəsi:

```text
https://maglev-digital-twin-api.onrender.com
```

WebSocket URL belə olacaq:

```text
wss://your-railway-domain.up.railway.app/ws/telemetry
```

Backend yoxlama URL-i:

```text
https://your-railway-domain.up.railway.app/api/health
```

Bu URL `{"ok":true,...}` qaytarmalıdır. Əgər `404` qaytarırsa, Railway hələ FastAPI backend-i deyil, yanlış folderi və ya yanlış start command-ı deploy edir.

### 2. Frontend deploy

Vercel-də project root kimi `frontend` seç.

Build ayarları:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Environment variable:

```text
VITE_BACKEND_WS_URL=wss://maglev-digital-twin-api.onrender.com/ws/telemetry
```

Sonra Vercel frontend-i rebuild et.

### 3. Production yoxlama

Deploydan sonra:

- `/api/config` backend-də açılmalıdır.
- Frontend yuxarıda “Canlı əlaqə aktivdir” göstərməlidir.
- Start düyməsi telemetry-ni hərəkətə gətirməlidir.
- Qrafiklər boş qalmamalıdır.
