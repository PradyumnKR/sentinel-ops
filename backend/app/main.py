from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine
from app.routers.auth_router import router as auth_router
from app.routers.incident_router import router as incident_router
from app.routers.comment_router import router as comment_router
from app.routers.activity_log_router import router as activity_log_router
from app.models.user import User
from app.models.comment import Comments
from app.models.incident import Incident
from app.models.incident_activity_log import IncidentActivityLogs
app = FastAPI()

origins = [
    "http://localhost:5173",  # Default Vite + React port
    "http://localhost:3000",  # Default Create React App port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Add the CORS middleware to your FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows specific origins
    allow_credentials=True,           # Allows cookies and auth headers
    allow_methods=["*"],              # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],              # Allows all headers
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(incident_router,prefix="/api/incidents",tags=["incidents"])
app.include_router(comment_router,prefix="/api/incidents",tags=["comments"])
app.include_router(activity_log_router, prefix="/api/incidents", tags=["activity logs"])
print(engine)

@app.get("/")
async def root():
    return {
        "message" : "Welcome to SentinelOps."
    }

@app.get("/api/test")
async def test():
    return { 
        "message" : "Backend access done. Frontend + Backend connection esatablished."
    }