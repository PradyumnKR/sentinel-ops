from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.comment_schema import CommentCreate, CommentResponse
from app.services.comment_service import create_comment, get_comments, delete_comment

router = APIRouter()

# POST /api/incidents/{incident_id}/comments
@router.post("/{incident_id}/comments",response_model=CommentResponse)
def create_comment_route(
    incident_id : int,
    comment_data:CommentCreate,
    db: Session = Depends(get_db),
    current_user : User  = Depends(get_current_user)
):
    return create_comment(db,incident_id,current_user.id,comment_data)
# GET  /api/incidents/{incident_id}/comments
@router.get("/{incident_id}/comments",response_model=list[CommentResponse])
def get_comments_route(
    incident_id:int,
    db:Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    comments = get_comments(db,incident_id)
    return comments
# DELETE /api/incidents/{incident_id}/comments/{comment_id}
@router.delete("/{incident_id}/comments/{comment_id}")
def delete_comment_route(
    incident_id:int,
    comment_id : int,
    db:Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    deleted = delete_comment(db, comment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted"}