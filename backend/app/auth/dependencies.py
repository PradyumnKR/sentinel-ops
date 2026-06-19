from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.auth.jwt import decode_access_token
from app.services.user_service import get_user_by_id
from app.database.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
)-> User: 
    # 1. decode the token → payload
    # 2. get user_id from payload.get("sub")
    # 3. if user_id is None → raise HTTPException 401, "Invalid token"
    # 4. fetch user using get_user_by_id(db, int(user_id))
    # 5. if user is None → raise HTTPException 401, "User not found"
    # 6. return user
    try:
        decoded_token = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = decoded_token.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )
    user = get_user_by_id(db,int(user_id))
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    return user