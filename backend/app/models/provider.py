from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    Integer,
    ForeignKey,
    DateTime,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Provider(Base):
    __tablename__ = "providers"

    provider_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False
    )
    services = Column(ARRAY(String), default=[])
    pricing = Column(Float, default=0.0)
    availability = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    documents = Column(ARRAY(String), default=[])
    approved = Column(Boolean, default=False)
    experience_years = Column(Integer, default=0)
    service_radius = Column(Float, default=10.0)  # km
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)


    # Relationships
    user = relationship("User", backref="provider_profile")
    bookings = relationship("Booking", back_populates="provider")
    reviews = relationship("Review", back_populates="provider")
