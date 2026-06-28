from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.schemas.incident_schema import IncidentCreate, IncidentUpdate, IncidentResponse
from app.services.ai_service import run_triage
from app.services.incident_service import (
    create_incident, get_incident, get_incidents, 
    update_incident, delete_incident
)

router = APIRouter()

# POST /api/incidents
@router.post("/", response_model=IncidentResponse)
def create_incident_route(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if incident_data.assigned_to is not None and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can set assignment")
    return create_incident(db, incident_data, created_by=current_user.id)
    
# GET /api/incidents
@router.get("/")
def get_incidents_route(
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    incidents = get_incidents(db)
    return incidents
# GET /api/incidents/{incident_id}
@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_route(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
# PUT /api/incidents/{incident_id}
@router.put("/{incident_id}")
def update_incident_route(
    incident_data : IncidentUpdate,
    incident_id:int,
    current_user : User =Depends(get_current_user),
    db:Session = Depends(get_db)
):
    update_fields = incident_data.model_dump(exclude_unset=True)
    if "assigned_to" in update_fields and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can change assignment")

    updated = update_incident(db, incident_id, incident_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")
    return updated
# DELETE /api/incidents/{incident_id}
@router.delete("/{incident_id}")
def delete_incident_route(
    incident_id:int,
    current_user : User =Depends(get_current_user),
    db:Session = Depends(get_db)
):
    deleted = delete_incident(db, incident_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"message": "Incident deleted"}


@router.post("/{incident_id}/analyze")
def analyze_incident(incident_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    result = run_triage(
        title=incident.title,
        description=incident.description,
        category=incident.category,
    )

    incident.ai_severity = result["ai_severity"]
    incident.ai_summary = result["ai_summary"]
    incident.ai_recommended_action = result["ai_recommended_action"]

    db.commit()
    db.refresh(incident)

    return {
        "incident_id": incident_id,
        "ai_severity": incident.ai_severity,
        "ai_summary": incident.ai_summary,
        "ai_recommended_action": incident.ai_recommended_action,
    }