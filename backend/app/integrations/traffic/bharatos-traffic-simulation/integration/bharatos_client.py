"""
BharatOS API Client
===================
Transmits detected traffic events and emergency dispatches to the live BharatOS Gateway.
Handles network timeouts gracefully so camera simulation runs reliably even if
BharatOS is temporarily offline.
"""

from typing import Dict, Any, Optional
import json
import requests

from integration.event_schemas import EmergencyDispatchPayload, TrafficIncidentSyncPayload


class BharatOSClient:
    """
    HTTP Client communicating with BharatOS Municipal API Gateway.
    """

    def __init__(
        self,
        base_url: str = "http://localhost:8000/api/v1",
        auth_token: Optional[str] = None,
        timeout: float = 3.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.auth_token = auth_token
        self.timeout = timeout

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "BharatOS-YOLO-Simulator/1.0",
        }
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers

    def check_connection(self) -> bool:
        """
        Pings BharatOS health endpoint to verify reachability.
        """
        try:
            url = f"{self.base_url}/health"
            res = requests.get(url, timeout=self.timeout)
            return res.status_code in [200, 204]
        except Exception:
            return False

    def send_emergency_dispatch(
        self,
        payload: EmergencyDispatchPayload,
    ) -> Dict[str, Any]:
        """
        Post emergency vehicle detection to queue an AI green corridor recommendation.
        Endpoint: POST /api/v1/traffic/events/emergency-dispatch
        """
        url = f"{self.base_url}/traffic/events/emergency-dispatch"
        try:
            res = requests.post(
                url,
                headers=self._get_headers(),
                json=payload.model_dump(),
                timeout=self.timeout,
            )
            if res.status_code in [200, 201]:
                return {"success": True, "status_code": res.status_code, "data": res.json()}
            else:
                return {
                    "success": False,
                    "status_code": res.status_code,
                    "error": res.text,
                    "endpoint": url,
                }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "status_code": 0,
                "error": f"Connection failed to BharatOS at {url}: {str(e)}",
                "endpoint": url,
            }

    def send_incident_sync(
        self,
        payload: TrafficIncidentSyncPayload,
    ) -> Dict[str, Any]:
        """
        Sync a detected road hazard or severe congestion to BharatOS Incidents.
        Endpoint: POST /api/v1/traffic/sync/incident
        """
        url = f"{self.base_url}/traffic/sync/incident"
        try:
            res = requests.post(
                url,
                headers=self._get_headers(),
                json=payload.model_dump(),
                timeout=self.timeout,
            )
            if res.status_code in [200, 201]:
                return {"success": True, "status_code": res.status_code, "data": res.json()}
            else:
                return {
                    "success": False,
                    "status_code": res.status_code,
                    "error": res.text,
                    "endpoint": url,
                }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "status_code": 0,
                "error": f"Connection failed to BharatOS at {url}: {str(e)}",
                "endpoint": url,
            }
