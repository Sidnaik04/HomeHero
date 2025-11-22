from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.user import UserType


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    user_type: UserType
    location: Optional[str] = None
    pincode: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        phone = "".join(filter(str.isdigit, v))
        if len(phone) < 10 or len(phone) > 15:
            raise ValueError("Phone number must be between 10-15 digits")
        return phone

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("name must be at least 2 characters long")
        if len(v.strip()) > 100:
            raise ValueError("name must not exceed 100 chars")
        return v.strip()


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    pincode: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    is_active: Optional[bool] = None  # ✅ Can be None
    is_verified: Optional[bool] = None  # ✅ Can be None
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LocationUpdate(BaseModel):
    location: str
    pincode: str

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError("Pincode must be exactly 6 digits")
        return v


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v
