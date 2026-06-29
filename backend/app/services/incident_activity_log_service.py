from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.incident_activity_log import IncidentActivityLogs
from typing import Sequence
def create_activity_log(
    db: Session,
    incident_id: int,
    performed_by: int,
    activity_type: str,
    message: str,
    old_value: str = "",
    new_value: str = ""
) -> IncidentActivityLogs:
    # create IncidentActivityLogs object, add, commit, refresh, return
    activity_log = IncidentActivityLogs(incident_id= incident_id, performed_by=performed_by,activity_type=activity_type,old_value = old_value,new_value = new_value, message = message)
    db.add(activity_log)
    db.commit()
    db.refresh(activity_log)
    return activity_log


def get_activity_logs(db: Session, incident_id: int) -> Sequence[IncidentActivityLogs]:
    # get all logs where incident_id matches, ordered by created_at
    stmt = select(IncidentActivityLogs).where(IncidentActivityLogs.incident_id == incident_id).order_by(IncidentActivityLogs.created_at)
    return db.execute(stmt).scalars().all()

def get_recent_activity_logs(db:Session, limit: int = 5)->Sequence[IncidentActivityLogs]:
    stmt = select(IncidentActivityLogs).order_by(IncidentActivityLogs.created_at.desc())
    if limit is not None:
        stmt = stmt.limit(limit)
    return db.execute(stmt).scalars().all()