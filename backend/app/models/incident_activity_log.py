from sqlalchemy import Column,BigInteger,TEXT,TIMESTAMP,String,ForeignKey
from app.database.session import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship


class IncidentActivityLogs(Base):
    __tablename__="incident_activity_logs"
    id = Column(BigInteger,primary_key=True,index=True)
    incident_id = Column(BigInteger,ForeignKey("incidents.id"),nullable=False)
    performed_by = Column(BigInteger,ForeignKey("users.id"),nullable=False)
    activity_type = Column(String(100))

    old_value = Column(TEXT)
    new_value = Column(TEXT)

    message = Column(TEXT)

    created_at = Column(TIMESTAMP,server_default=func.now())

    user = relationship("User",back_populates="incident_activity_logs")

    incident = relationship("Incident",back_populates="incident_activity_logs")
    