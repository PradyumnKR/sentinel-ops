from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.incident import Incident
from app.schemas.incident_schema import IncidentCreate, IncidentUpdate
from app.services.incident_activity_log_service import create_activity_log
from datetime import datetime

def create_incident(db: Session, incident_data: IncidentCreate, created_by: int) -> Incident:
    # create Incident object, set created_by, add, commit, refresh, return
    incident = Incident(title=incident_data.title,description=incident_data.description,severity=incident_data.severity,status=incident_data.status,category=incident_data.category,location=incident_data.location,resolution_notes=incident_data.resolution_notes,assigned_to=incident_data.assigned_to,created_by =created_by)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    create_activity_log(
    db,
    incident_id=incident.id,
    performed_by=created_by,
    activity_type="incident_created",
    message=f"Incident '{incident.title}' was created"
)
    return incident



def get_incident(db: Session, incident_id: int) -> Incident | None:
    stmt = select(Incident).where(Incident.id == incident_id)
    return db.execute(stmt).scalar_one_or_none()

def get_incidents(db: Session, skip: int = 0, limit: int = 100) -> list[Incident]:
    # fetch all, with pagination
    stmt = select(Incident).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all() # type: ignore

def update_incident(db: Session, incident_id: int, incident_data: IncidentUpdate) -> Incident | None:
    # get incident, update only fields that are not None, commit, refresh, return
    incident = db.get(Incident, incident_id)

    if not incident:
        return None

    if incident.status == "Resolved":
        raise ValueError("Resolved incidents cannot be edited")

    updated_data = incident_data.model_dump(exclude_unset=True)

    if updated_data.get("status") == "Resolved":
        res_notes = updated_data.get("resolution_notes") or incident.resolution_notes
        if not res_notes or not res_notes.strip():
            raise ValueError("Resolution notes are required before resolving")
        incident.resolved_at = datetime.utcnow()

    for field,value in updated_data.items():
        old = str(getattr(incident, field))
        setattr(incident,field,value)
        create_activity_log(
        db,
        incident_id=incident.id,
        performed_by=incident.created_by,
        activity_type="incident_updated",
        message=f"{field} was updated",
        old_value=old,
        new_value=str(value)
        )
    db.commit()
    db.refresh(incident)
    return incident

def delete_incident(db: Session, incident_id: int) -> bool:
    # get incident, if not found return False, delete, commit, return True
    incident = db.get(Incident,incident_id)
    if not incident:
        return False
    db.delete(incident)
    db.commit()
    return True