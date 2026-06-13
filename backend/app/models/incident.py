from sqlalchemy import Column, BigInteger,TEXT,String,TIMESTAMP,ForeignKey
from app.database.session import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.orm import mapped_column,Mapped

class Incident(Base):
    __tablename__="incidents"

    id :Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )
    title = Column(String(255),nullable=False)

    description = Column(TEXT)

    severity = Column(String(50))
    status = Column(String(50))
    category = Column(String(100))

    location = Column(String(255))

    created_by : Mapped[int] = mapped_column(BigInteger,ForeignKey("users.id"))
    assigned_to = Column(BigInteger,ForeignKey("users.id"))
    closed_by = Column(BigInteger,ForeignKey("users.id"))

    ai_summary = Column(TEXT)
    ai_severity = Column(String(50))
    ai_recommended_action = Column(TEXT)

    resolution_notes = Column(TEXT)

    created_at = Column(TIMESTAMP,server_default=func.now())

    updated_at = Column(TIMESTAMP,server_default=func.now(),onupdate=func.now())

    resolved_at = Column(TIMESTAMP, nullable=True)

    comments = relationship("Comments",back_populates="incident")

    incident_activity_logs = relationship("IncidentActivityLogs",back_populates="incident")

    
