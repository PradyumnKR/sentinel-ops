from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_to: Optional[int] = None


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_to: Optional[int] = None

class IncidentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    severity: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    created_by: Optional[int] = None
    closed_by: Optional[int] = None
    assigned_to: Optional[int] = None
    resolution_notes: Optional[str] = None
    ai_summary : Optional[str] = None
    ai_severity: Optional[str] = None
    ai_recommended_action : Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    
    
    class Config:
        from_attributes = True
