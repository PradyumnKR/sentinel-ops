from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityLogResponse(BaseModel):
    id: int
    incident_id: int
    performed_by: int
    activity_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True