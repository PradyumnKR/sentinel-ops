from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.activity_log_schema import ActivityLogResponse
from app.services.incident_activity_log_service import get_activity_logs
from typing import Sequence

router = APIRouter()
# GET /api/incidents/{incident_id}/activity
@router.get("/{incident_id}/activity", response_model=list[ActivityLogResponse])
def get_activity_logs_route(
    incident_id:int,
    db:Session = Depends(get_db),
    current_user:User=Depends(get_current_user)
)->Sequence[ActivityLogResponse]:
    activity_logs = get_activity_logs(db,incident_id)
    return activity_logs