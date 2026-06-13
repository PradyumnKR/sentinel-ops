from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.core.config import settings

def create_access_token(data: dict) -> str:
    # 1. copy the data dict
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # 2. calculate expire time using datetime.now(timezone.utc) + timedelta(minutes=...)
    # 3. add "exp" to the copied dict
    to_encode.update({"exp":expire})
    # 4. encode and return using jwt.encode(...)
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    # 1. try to decode using jwt.decode(...)
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise ValueError("Invalid Token")
    # 2. return the payload
    # 3. except JWTError → raise ValueError("Invalid token")







