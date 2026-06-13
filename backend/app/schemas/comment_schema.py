from pydantic import BaseModel
from datetime import datetime

class CommentCreate(BaseModel):
    content : str

class CommentResponse(BaseModel):
    id : int
    incident_id : int
    user_id : int
    content : str
    created_at: datetime
    updated_at : datetime

    class Config:
        from_attributes = True
