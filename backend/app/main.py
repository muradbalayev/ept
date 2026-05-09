import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import CONFIG
from .schemas import ClientMessage
from .simulator import Simulator


app = FastAPI(title="Maglev Digital Twin API")
simulator = Simulator(CONFIG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/config")
async def get_config() -> dict:
    return CONFIG.model_dump()


@app.post("/api/reset")
async def reset() -> dict:
    simulator.reset()
    return {"ok": True, "telemetry": simulator.telemetry().model_dump()}


def handle_message(raw_message: str) -> None:
    message = ClientMessage.model_validate(json.loads(raw_message))

    if message.type == "start":
        simulator.start()
    elif message.type == "stop":
        simulator.stop()
    elif message.type == "reset":
        simulator.reset()
    elif message.type == "set_parameters" and message.payload is not None:
        simulator.set_parameters(message.payload)


@app.websocket("/ws/telemetry")
async def telemetry_socket(websocket: WebSocket) -> None:
    await websocket.accept()

    async def receive_loop() -> None:
        async for text in websocket.iter_text():
            handle_message(text)

    receiver = asyncio.create_task(receive_loop())
    try:
        while not receiver.done():
            simulator.step(1.0 / 60.0)
            simulator.step(1.0 / 60.0)
            await websocket.send_json(simulator.telemetry().model_dump())
            await asyncio.sleep(1.0 / 30.0)
    except (RuntimeError, WebSocketDisconnect):
        pass
    finally:
        if not receiver.done():
            receiver.cancel()
