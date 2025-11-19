from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List

from app.models.user import User, UserType
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.core.validators import InputSanitizer


class UserController:

    # create new user
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        try:
            name = InputSanitizer.validate_name(user_data.name)
            email = InputSanitizer.validate_email(user_data.email)
            phone = InputSanitizer.validate_phone(user_data.phone)
            location = InputSanitizer.validate_location(user_data.location or "")
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        # check if user already exists
        existing_user = (
            db.query(User).filter((User.email == email) | (User.phone == phone)).first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists"
            )

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        user = User(
            name=name,
            email=email,
            phone=phone,
            hashed_password=hashed_password,
            user_type=user_data.user_type,
            location=location,
            pincode=user_data.pincode,
        )

        db.add(user)
        db.flush()

        if user_data.user_type == UserType.PROVIDER:
            from app.models.provider import Provider

            provider_profile = Provider(
                user_id=user.id,
                services=[],  # Empty initially, provider will update later
                pricing=0.0,
                availability=True,
                approved=False,  # Needs admin approval
                rating=0.0,
                rating_count=0,
                experience_years=0,
                service_radius=10.0,
            )
            db.add(provider_profile)

        db.commit()
        db.refresh(user)
        return user

    # get user by id
    @staticmethod
    def get_user(db: Session, user_id: str) -> User:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return user

    # update user
    @staticmethod
    def update_user(db: Session, user_id: str, user_data: UserUpdate) -> User:
        user = UserController.get_user(db, user_id)

        # validate and sanitize updated fields
        update_data = {}
        for field, value in user_data.model_dump(exclude_unset=True).items():
            if value is not None:
                try:
                    if field == "name":
                        update_data[field] = InputSanitizer.validate_name(value)
                    elif field == "email":
                        update_data[field] = InputSanitizer.validate_email(value)
                    elif field == "phone":
                        update_data[field] = InputSanitizer.validate_phone(value)
                    elif field == "location":
                        update_data[field] = InputSanitizer.validate_location(value)
                    else:
                        update_data[field] = value

                except ValueError as e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Validation error for {field}: {str(e)}",
                    )

        # check for email/phone conflicts
        if "email" in update_data or "phone" in update_data:
            existing_user = db.query(User).filter(User.id != user_id)

            if "email" in update_data:
                existing_user = existing_user.filter(User.email == update_data["email"])
            if "phone" in update_data:
                existing_user = existing_user.filter(User.phone == update_data["phone"])

            if existing_user.first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email or phone already exists",
                )

        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    # delete user
    @staticmethod
    def delete_user(db: Session, user_id: str):
        user = UserController.get_user(db, user_id)
        db.delete(user)
        db.commit()

    # get all users
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    # update location
    @staticmethod
    def update_location(db: Session, user_id: str, location: str, pincode: str) -> User:
        user = UserController.get_user(db, user_id)

        try:
            location = InputSanitizer.validate_location(location)
            if not pincode.isdigit() or len(pincode) != 6:
                raise ValueError("Pincode must be exactly 6 digits")
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        user.location = location
        user.pincode = pincode
        db.commit()
        db.refresh(user)
        return user
