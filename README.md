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
