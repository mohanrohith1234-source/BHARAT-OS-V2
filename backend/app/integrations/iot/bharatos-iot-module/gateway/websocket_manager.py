import json
import logging
from typing import List, Optional
from fastapi import WebSocket
from devices.models import MotorCommandRequest, ESP32StatusMessage, MotorStatus
from .motor_controller import MotorController

logger = logging.getLogger("websocket_manager")

class WebSocketManager:
    def __init__(self, controller: MotorController):
        self.controller = controller
        self.dashboard_sockets: List[WebSocket] = []
        self.esp32_socket: Optional[WebSocket] = None
        self.controller.register_status_callback(self.broadcast_status)

    async def connect_dashboard(self, websocket: WebSocket):
        await websocket.accept()
        self.dashboard_sockets.append(websocket)
        logger.info(f"Dashboard client connected. Active connections: {len(self.dashboard_sockets)}")
        # Send current status on initial connection
        status = self.controller.get_status()
        status.connected_dashboards = len(self.dashboard_sockets)
        await websocket.send_text(status.model_dump_json())

    def disconnect_dashboard(self, websocket: WebSocket):
        if websocket in self.dashboard_sockets:
            self.dashboard_sockets.remove(websocket)
            logger.info(f"Dashboard client disconnected. Active connections: {len(self.dashboard_sockets)}")

    async def connect_esp32(self, websocket: WebSocket):
        await websocket.accept()
        self.esp32_socket = websocket
        self.controller.set_esp32_connection(True)
        await self.broadcast_status(self.controller.get_status())
        logger.info("ESP32 hardware node connected via WebSocket.")

    async def disconnect_esp32(self):
        self.esp32_socket = None
        self.controller.set_esp32_connection(False)
        await self.broadcast_status(self.controller.get_status())
        logger.info("ESP32 hardware node disconnected.")

    async def handle_esp32_message(self, raw_data: str):
        try:
            data = json.loads(raw_data)
            status_msg = ESP32StatusMessage(**data)
            self.controller.update_from_esp32_status(status_msg)
            await self.broadcast_status(self.controller.get_status())
        except Exception as e:
            logger.error(f"Error parsing message from ESP32: {e}")

    async def dispatch_command(self, cmd_req: MotorCommandRequest):
        payload = await self.controller.handle_command(cmd_req)
        
        # If hardware is connected, forward JSON to physical ESP32
        if self.esp32_socket and not self.controller.simulation_mode:
            try:
                await self.esp32_socket.send_text(payload.model_dump_json())
            except Exception as e:
                logger.error(f"Failed to send command to ESP32: {e}")
                await self.disconnect_esp32()

        return payload

    async def broadcast_status(self, status: MotorStatus):
        status.connected_dashboards = len(self.dashboard_sockets)
        msg_str = status.model_dump_json()
        disconnected = []
        for socket in self.dashboard_sockets:
            try:
                await socket.send_text(msg_str)
            except Exception:
                disconnected.append(socket)

        for socket in disconnected:
            self.disconnect_dashboard(socket)
