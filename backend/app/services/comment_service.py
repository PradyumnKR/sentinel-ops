from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.comment import Comments
from app.schemas.comment_schema import CommentCreate
from app.services.incident_activity_log_service import create_activity_log

def create_comment(db: Session, incident_id: int, user_id: int, comment_data: CommentCreate) -> Comments:
    # create Comments object, add, commit, refresh, return
    comment = Comments(incident_id=incident_id,user_id=user_id,content=comment_data.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    create_activity_log(
    db,
    incident_id=incident_id,
    performed_by=user_id,
    activity_type="comment_added",
    message="A comment was added"
    )
    return comment

def get_comments(db: Session, incident_id: int) -> list[Comments]:
    # get all comments where Comments.incident_id == incident_id
    stmt = select(Comments).where(Comments.incident_id ==incident_id)
    return db.execute(stmt).scalars().all() #type: ignore
def delete_comment(db: Session, comment_id: int) -> bool:
    # get by id, if not found return False, delete, commit, return True
    comment = db.get(Comments,comment_id)
    if not comment:
        return False
    db.delete(comment)
    db.commit()
    return True
    