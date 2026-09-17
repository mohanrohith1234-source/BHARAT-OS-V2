# BharatOS: Real Data & API Integration Backlog

**Document Version:** 1.0.0  
**Created:** September 17, 2026  
**Status:** READY FOR IMPLEMENTATION PLANNING  
**Target Milestone:** Smart India Hackathon (SIH) 2026 — Phase 2 Architecture Upgrade

This backlog contains verified, actionable engineering tasks derived directly from the discovery audit in docs/REAL_DATA_API_AUDIT.md. Every task enforces zero-downtime offline fallbacks and honest UI provenance tagging.

---

## Phase 1: Local Knowledge Base & Reference Data Ingestion

- [ ] **Task 1.1: Consolidate Visakhapatnam Emergency Facilities Seed**
  - **Source:** ackend/app/data_sources/vizag_public_snapshot.json + data.gov.in Hospital Directory + AP Police Directory.
  - **Action:** Execute automated seed script loading ~120 verified Visakhapatnam hospitals, police stations, fire stations, and relief centers into SQLite/PostgreSQL acilities table.
  - **Fields:** Name, facility type, address, telephone, latitude, longitude, source_type='OFFICIAL_PUBLIC', erified_at.
  - **Fallback:** Pre-packaged JSON snapshot bundled in repository.

- [ ] **Task 1.2: Municipal Ward & Catchment GeoJSON Boundaries**
  - **Source:** Greater Visakhapatnam Municipal Corporation (GVMC) Open GIS.
  - **Action:** Load GeoJSON boundary polygons for Ward 12 (MVP Colony & RK Beach Outfall) and low-lying coastal sectors into zones and wards tables.
  - **UI Integration:** Rendered as vector risk polygons in Digital Twin and MapContainer.tsx.

---

## Phase 2: Live Situational Awareness Ingest Adapters

- [ ] **Task 2.1: Implement Resilient Weather & Nowcast Adapter (WeatherAdapter)**
  - **Source:** Open-Meteo High-Resolution Weather API (pi.open-meteo.com/v1/forecast) mapped to IMD Warning Color Schema.
  - **Action:** Create ackend/app/integrations/weather/adapter.py fetching live precipitation, wind speed, and rain rate for Visakhapatnam coordinates (17.6868, 83.2185).
  - **Normalization:** Map rainfall thresholds to IMD warning levels (Green < 15mm/h, Yellow 15-30mm/h, Orange 30-50mm/h, Red > 50mm/h).
  - **Fallback:** 4.0s timeout with automatic transition to NowcastService deterministic physics simulation (T00_NORMAL to T70_RISK_NORMALIZED).

- [ ] **Task 2.2: Implement South Asia Regional Earthquake Feed (SeismicAdapter)**
  - **Source:** USGS Real-Time Earthquake GeoJSON API (FDSN Web Service).
  - **Action:** Create ackend/app/integrations/seismic/adapter.py polling for M2.5+ events within India geographical bounding box (minlat=6.0, maxlat=37.0, minlon=68.0, maxlon=98.0).
  - **Normalization:** Ingest into backend lerts table with category='EARTHQUAKE' and link to Risk Assessment Agent.
  - **Fallback:** Cache last 10 events; if network unavailable, retain normal baseline without UI errors.

- [ ] **Task 2.3: Implement Bay of Bengal Coastal & Tsunami Feed (CoastalAdapter)**
  - **Source:** INCOIS / ITEWC Coastal Bulletins (Public RSS/XML).
  - **Action:** Create ackend/app/integrations/coastal/adapter.py parsing tidal anomaly and swell surge warnings for East Coast / Andhra Pradesh maritime zone.
  - **Normalization:** Feed swell alerts into Hydro-Nowcasting Agent and Digital Twin coastal layer.
  - **Fallback:** Static tidal reference curves and seasonal monsoon baseline.

---

## Phase 3: Spatial Cartography & ISRO Bhuvan Integration

- [ ] **Task 3.1: Add ISRO Bhuvan WMS Layer in Leaflet**
  - **Source:** NRSC / ISRO Bhuvan OGC Web Map Service (https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms).
  - **Action:** In rontend/components/ui/MapContainer.tsx, add a layer selector toggle allowing operators to switch between:
    1. CartoDB Dark Matter (Optimized Dark Mode)
    2. ISRO Bhuvan Satellite Imagery (india3 layer)
    3. OpenStreetMap Emergency Carto
  - **Fallback:** If Bhuvan WMS connection fails or times out, seamlessly default to CartoDB dark tiles with zero visual disruption.

- [ ] **Task 3.2: Render Bhuvan Flood Hazard Zonation Overlays**
  - **Source:** Bhuvan Disaster Services WMS (Flood Inundation Layers).
  - **Action:** Overlay semi-transparent raster/vector flood hazard contours on the Digital Twin canvas (/dashboard/digital-twin).

---

## Phase 4: Provenance UI Transparency & Audit Trail

- [ ] **Task 4.1: Unified Provenance Tagging in API Responses**
  - **Action:** Ensure every backend API response model includes provenance metadata (LIVE, CACHED, REFERENCE, SIMULATED, AI_DERIVED).
  - **Schema:** Standardize ProvenanceType across FastAPI Pydantic models and TypeScript store types.

- [ ] **Task 4.2: Frontend Provenance Indicator Chips**
  - **Action:** Verify that all dashboard cards (Weather Telemetry, Facility List, Early Warnings, Fleet Strip) display honest provenance chips in the UI:
    - ● LIVE FEED (Open-Meteo)
    - ● REFERENCE DATA (GVMC Gazette)
    - ● SIMULATED DATA (Vizag IoT Twin)
    - ● AI DERIVED (Multi-Agent Plan)

---

## Phase 5: Simulated Fleet & Operational Boundary Integrity

- [ ] **Task 5.1: Lock Sensitive Operational Entities to Simulation Engine**
  - **Policy Rule:** Police patrol units (P-305), Fire rescue tenders (FT-12), Ambulances (AMB-042), and Dewatering pumps (DP-04) must remain managed by the internal simulation engine (useVizagDataStore.ts).
  - **Validation:** Ensure no code or documentation falsely claims direct live GPS integration with police CAD or 108 emergency dispatch servers.

- [ ] **Task 5.2: Lock Hospital Bed Live Telemetry to Simulation Engine**
  - **Policy Rule:** Hospital facility coordinates and trauma designations are real reference data; however, real-time ICU/ventilator bed availability counts must remain simulated.
  - **Validation:** Display OCCUPANCY: SIMULATED ESTIMATION (TRIAGE MODEL) on hospital facility cards.

---

## Implementation Priority Summary

| Backlog Item | Complexity | Auth Requirement | Immediate Hackathon Value | Target Phase |
|---|---|---|---|---|
| **1.1 Facility Seed** | Low | None (Local DB) | High (Authentic coordinates) | Phase 2.1 |
| **2.1 Weather Adapter** | Low | None (Open-Meteo) | Very High (Real nowcasting) | Phase 2.2 |
| **2.2 Seismic Feed** | Low | None (USGS Keyless) | High (Multi-hazard capability) | Phase 2.3 |
| **3.1 Bhuvan WMS** | Medium | None (Public WMS) | High (ISRO branding) | Phase 2.4 |
| **2.3 Coastal Feed** | Medium | None (Public RSS) | High (Visakhapatnam port demo) | Phase 2.5 |
| **4.2 Provenance Chips**| Low | None (UI Polish) | Crucial (Honest evaluation) | Phase 2.6 |
