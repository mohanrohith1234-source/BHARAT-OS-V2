import logging
import httpx
from typing import Dict, AsyncGenerator
from config.settings import settings

logger = logging.getLogger("camera")

class ESP32CameraProxy:
    """
    Handles streaming MJPEG video and grabbing snapshots from physical ESP32-CAM nodes.
    Supports port 80 (HTTP control/capture) and port 81 (MJPEG stream).
    """

    @staticmethod
    def normalize_target_url(target: str) -> str:
        clean = target.strip()
        if not clean.startswith("http://") and not clean.startswith("https://"):
            clean = f"http://{clean}"
        if clean.rstrip("/").count("/") == 2 and ":" not in clean[7:]:
            clean = f"{clean.rstrip('/')}:{settings.CAM_STREAM_PORT}/stream"
        return clean

    @classmethod
    async def stream_mjpeg(cls, host_url: str) -> AsyncGenerator[bytes, None]:
        target = cls.normalize_target_url(host_url)
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=5.0)) as client:
                async with client.stream("GET", target) as response:
                    async for chunk in response.aiter_bytes():
                        yield chunk
        except Exception as e:
            logger.warning(f"Camera stream error from {target}: {e}")

    @classmethod
    async def probe_ports(cls, host: str) -> Dict:
        clean_host = host.replace("http://", "").replace("https://", "").split(":")[0].split("/")[0]
        results = {}
        async with httpx.AsyncClient(timeout=2.0) as client:
            try:
                r80 = await client.get(f"http://{clean_host}:{settings.CAM_CONTROL_PORT}/")
                results["port_80"] = {"status": r80.status_code, "accessible": True}
            except Exception as e:
                results["port_80"] = {"accessible": False, "error": str(e)}

            try:
                r81 = await client.get(f"http://{clean_host}:{settings.CAM_STREAM_PORT}/stream", timeout=2.0)
                results["port_81_stream"] = {"status": r81.status_code, "accessible": True}
            except Exception as e:
                results["port_81_stream"] = {"accessible": False, "error": str(e)}

        return {"host": clean_host, "results": results}

    @classmethod
    async def capture_snapshot(cls, host_url: str) -> bytes:
        clean_host = host_url.rstrip("/")
        if not clean_host.startswith("http://") and not clean_host.startswith("https://"):
            clean_host = f"http://{clean_host}"
        
        target = f"{clean_host}/capture"
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(target)
            if res.status_code == 200:
                return res.content
            raise RuntimeError(f"ESP32-CAM returned status {res.status_code}")
