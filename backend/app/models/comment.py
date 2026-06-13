from sqlalchemy import (
    Column,
    BigInteger,
    TEXT,
    TIMESTAMP,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.session import Base


class Comments(Base):
    __tablename__ = "comments"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    incident_id = Column(
        BigInteger,
        ForeignKey("incidents.id"),
        nullable=False
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.id"),
        nullable=False
    )

    content = Column(
        TEXT,
        nullable=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

    user = relationship(
        "User",
        back_populates="comments"
    )

    incident = relationship(
        "Incident",
        back_populates="comments"
    )