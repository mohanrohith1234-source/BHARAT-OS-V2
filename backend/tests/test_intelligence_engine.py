import pytest
import uuid
from app.db.session import SessionLocal
from app.models.models import Incident
from app.services.intelligence_engine_service import IntelligenceEngineService

def test_intelligence_engine_generation():
    db = SessionLocal()
    try:
        inc = Incident(
            id=uuid.uuid4(),
            ticket_number=f"INC-{uuid.uuid4().hex[:6].upper()}",
            category="Flood",
            title="[TEST FLOOD] Beach Road Culvert Inundation",
            description="Water depth exceeds 4.5m mark",
            latitude=17.7210,
            longitude=83.3180,
            address="Beach Road Sector 4",
            severity="critical",
            status="active"
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        intel = IntelligenceEngineService.get_incident_intelligence(db, inc.id)

        assert intel["incident_id"] == str(inc.id)
        assert intel["risk_assessment"]["risk_level"] == "CRITICAL"
        assert intel["risk_assessment"]["risk_score"] == 92.5
        assert "affected_infrastructure" in intel["impact_assessment"]
        assert len(intel["evidence_chain"]) >= 3
        assert intel["why_analysis"]["why_escalated"] is not None
        assert intel["situational_summary"]["what_is_happening"] == inc.title
        assert len(intel["resource_intelligence"]["matched_resources"]) >= 1
        assert len(intel["action_dependencies"]) >= 2
        assert intel["provenance"] == "PROTOTYPE_SIMULATION"
    finally:
        db.close()

def test_prioritized_incidents():
    db = SessionLocal()
    try:
        inc1 = Incident(
            id=uuid.uuid4(),
            ticket_number=f"INC-{uuid.uuid4().hex[:6].upper()}",
            category="Accident",
            title="Siripuram Collision",
            description="Multi-vehicle traffic collision",
            latitude=17.7202,
            longitude=83.3156,
            severity="high",
            status="active"
        )
        db.add(inc1)
        db.commit()

        prio = IntelligenceEngineService.get_prioritized_incidents(db)
        assert len(prio) >= 1
        assert prio[0]["priority_level"] in ["CRITICAL", "HIGH"]
    finally:
        db.close()
