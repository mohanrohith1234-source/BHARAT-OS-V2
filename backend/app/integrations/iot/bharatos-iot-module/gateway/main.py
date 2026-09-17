import asyncio
import json
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from devices.models import MotorCommandRequest, MotorStatus
from .motor_controller import MotorController
from .websocket_manager import WebSocketManager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("gateway")

controller = MotorController()
ws_manager = WebSocketManager(controller)

@asynccontextmanager
async def lifespan(app: FastAPI):
    sim_task = None
    watchdog_task = None
    if settings.SIMULATION_MODE:
        sim_task = asyncio.create_task(controller.start_simulation_loop())
        logger.info("Simulation mode is ENABLED.")
    else:
        logger.info("Simulation mode is DISABLED. Expecting hardware ESP32 connection.")
        async def esp32_watchdog():
            while True:
                await asyncio.sleep(2.0)
                if controller.esp32_connected and controller.last_heartbeat:
                    delta = (datetime.now() - controller.last_heartbeat).total_seconds()
                    if delta > 5.0:
                        logger.warning(f"ESP32 heartbeat timed out ({delta:.1f}s ago). Marking DISCONNECTED.")
                        controller.set_esp32_connection(False)
                        await ws_manager.broadcast_status(controller.get_status())
        watchdog_task = asyncio.create_task(esp32_watchdog())

    yield

    if sim_task:
        sim_task.cancel()
    if watchdog_task:
        watchdog_task.cancel()

app = FastAPI(
    title=settings.MODULE_NAME,
    description="FastAPI REST & WebSocket Gateway for BharatOS IoT devices and sensors",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def get_health():
    return {
        "status": "healthy",
        "service": "bharatos-iot-gateway",
        "simulation_mode": controller.simulation_mode,
        "esp32_connected": controller.esp32_connected,
        "led_on": controller.led_on
    }

@app.get("/api/status", response_model=MotorStatus)
async def get_status():
    st = controller.get_status()
    st.connected_dashboards = len(ws_manager.dashboard_sockets)
    return st

@app.post("/api/motor/command")
async def post_motor_command(cmd_req: MotorCommandRequest):
    try:
        payload = await ws_manager.dispatch_command(cmd_req)
        return {
            "success": True,
            "message": f"Command '{cmd_req.command}' dispatched successfully",
            "payload": payload,
            "status": controller.get_status()
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Command execution error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(websocket: WebSocket):
    await ws_manager.connect_dashboard(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                raw_json = json.loads(data)
                cmd_req = MotorCommandRequest(**raw_json)
                await ws_manager.dispatch_command(cmd_req)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "message": "Invalid JSON"}))
            except ValueError as ve:
                await websocket.send_text(json.dumps({"type": "error", "message": str(ve)}))
            except Exception as e:
                logger.error(f"Error handling dashboard command: {e}")
                await websocket.send_text(json.dumps({"type": "error", "message": "Failed to process command"}))
    except WebSocketDisconnect:
        ws_manager.disconnect_dashboard(websocket)

@app.websocket("/ws/esp32")
async def websocket_esp32_endpoint(websocket: WebSocket):
    await ws_manager.connect_esp32(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.handle_esp32_message(data)
    except WebSocketDisconnect:
        logger.info("Hardware ESP32 socket disconnected.")
    except Exception as e:
        logger.error(f"ESP32 socket error: {e}")
    finally:
        await ws_manager.disconnect_esp32()
