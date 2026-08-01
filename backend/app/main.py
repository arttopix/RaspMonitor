import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.auth import create_access_token, verify_token, DEFAULT_USERNAME, DEFAULT_PASSWORD
from app.collector import collect_system_metrics
from app.websocket_manager import manager

app = FastAPI(title="RaspMonitor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
async def login(req: LoginRequest):
    if req.username == DEFAULT_USERNAME and req.password == DEFAULT_PASSWORD:
        token = create_access_token(data={"sub": req.username})
        return {"access_token": token, "token_type": "bearer", "username": req.username}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )

@app.get("/api/status")
async def get_status():
    metrics = collect_system_metrics()
    return {
        "status": "online",
        "version": "1.0.0",
        "hostname": metrics["system"]["hostname"],
        "os": metrics["system"]["os"],
        "uptime_seconds": metrics["system"]["uptime_seconds"]
    }

@app.get("/api/metrics")
async def get_current_metrics(token: str = Query(...)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    return collect_system_metrics()

@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket, token: str = Query(...)):
    if not verify_token(token):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket)
    try:
        while True:
            data = collect_system_metrics()
            await websocket.send_json(data)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
