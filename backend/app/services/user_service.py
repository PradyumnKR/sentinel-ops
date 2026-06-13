from sqlalchemy.orm import Session
from app.models.user import User
from sqlalchemy import select
from app.schemas.user_schema import UserCreate
from app.auth.password import hash_password

def get_user_by_id(db: Session, user_id: int) -> User | None:
    # fetch user from db where User.id == user_id
     return db.get(User, user_id)
    # hint: db.query(User).filter(...).first()
def get_user_by_email(db:Session,email:str) ->User | None:
     stmt = select(User).where(User.email == email)
     return db.execute(stmt).scalar_one_or_none()

def create_user(db: Session, user_data: UserCreate) -> User:
    # 1. hash the password using hash_password(user_data.password)
    # 2. create a User object with name, email, and hashed_password
    # 3. db.add(user), db.commit(), db.refresh(user)
    # 4. return user
    hashed_password = hash_password(user_data.password)
    user = User(name=user_data.name,email=user_data.email,hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
