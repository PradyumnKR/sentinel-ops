from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.password import verify_password
from app.auth.jwt import create_access_token
from app.services.user_service import get_user_by_email 
from app.schemas.user_schema import UserCreate, UserResponse
from app.services.user_service import create_user
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/login")
def login(

    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # 1. get user by email (form_data.username is the email)
    # 2. if no user → raise 401 "Invalid credentials"
    # 3. verify password (form_data.password, user.hashed_password)
    # 4. if wrong password → raise 401 "Invalid credentials"
    # 5. create token with {"sub": str(user.id)}
    # 6. return {"access_token": token, "token_type": "bearer"}
    user = get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    verified_password = verify_password(form_data.password,user.hashed_password) # type: ignore
    if not verified_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    data = {
        "sub": str(user.id)
    }
    token = create_access_token(data)
    return {
        "access_token" : token,
        "token_type" : "bearer"
    }

@router.post("/signup",response_model=UserResponse)
def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # 1. check if email already exists using get_user_by_email
    # 2. if exists → raise 400 "Email already registered"
    # 3. create user using create_user(db, user_data)
    # 4. return the user
    user = get_user_by_email(db,user_data.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    user = create_user(db,user_data)
    return user

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user