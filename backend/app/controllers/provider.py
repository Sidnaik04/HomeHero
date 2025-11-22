from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.provider import Provider
from app.models.user import User
from app.schemas.provider import ProviderCreate, ProviderUpdate
from app.services.geolocation import geo_service
from app.services.cache import cache
from app.core.decorators import cached


class ProviderController:

    # create new provider
    @staticmethod
    def create_provider(
        db: Session, provider_data: ProviderCreate, user_id: str
    ) -> Provider:
        # check if provider profile already exists
        existing_provider = (
            db.query(Provider).filter(Provider.user_id == user_id).first()
        )
        if existing_provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provider profile already exists",
            )

        provider = Provider(**provider_data.model_dump(), user_id=user_id)
        db.add(provider)
        db.commit()
        db.refresh(provider)
        return provider

    # get provider using provider id
    @staticmethod
    def get_provider(db: Session, provider_id: str) -> Provider:
        provider = (
            db.query(Provider).filter(Provider.provider_id == provider_id).first()
        )

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found"
            )

        return provider

    # get provider using user id
    @staticmethod
    def get_provider_by_user(db: Session, user_id: str) -> Provider:
        provider = db.query(Provider).filter(Provider.user_id == user_id).first()

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found",
            )

        return provider

    # update provider profile
    @staticmethod
    def update_provider(
        db: Session, provider_id: str, provider_data: ProviderUpdate
    ) -> Provider:
        provider = ProviderController.get_provider(db, provider_id)

        for field, value in provider_data.model_dump(exclude_unset=True).items():
            setattr(provider, field, value)

        db.commit()
        db.refresh(provider)
        return provider

    # search provider
    @staticmethod
    def search_provider(
        db: Session,
        service: Optional[str] = None,
        location: Optional[str] = None,
        min_rating: Optional[float] = None,
        available_only: bool = True,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Provider]:
        query = db.query(Provider).join(User)

        if service:
            query = query.filter(Provider.services.contains([service]))

        if location:
            query = query.filter(User.location.ilike(f"%{location}%"))

        if min_rating:
            query = query.filter(Provider.rating >= min_rating)

        if available_only:
            query = query.filter(Provider.availability == True)

        query = query.filter(Provider.approved == True)

        return query.offset(skip).limit(limit).all()

    # approve provider
    @staticmethod
    def approve_provider(db: Session, provider_id: str) -> Provider:
        provider = ProviderController.get_provider(db, provider_id)
        provider.approved = True
        db.commit()
        db.refresh(provider)
        return provider

    # update provider ratings
    def update_rating(db: Session, provider_id: str, new_rating: float):
        provider = ProviderController.get_provider(db, provider_id)

        # recalculate average rating
        total_rating = provider.rating * provider.rating_count + new_rating
        provider.rating_count += 1
        provider.rating = total_rating / provider.rating_count

        db.commit()
        db.refresh(provider)
        return provider

    # enhanced provider search with geolocation
    @staticmethod
    async def search_providers_with_location(
        db: Session,
        service: Optional[str] = None,
        location: Optional[str] = None,
        min_rating: Optional[float] = None,
        max_distance_km: Optional[float] = 25.0,
        available_only: bool = True,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Provider]:

        query = db.query(Provider).join(User)

        if service:
            query = query.filter(Provider.services.contains([service]))

        if min_rating:
            query = query.filter(Provider.rating >= min_rating)

        if available_only:
            query = query.filter(Provider.availability == True)

        query = query.filter(Provider.approved == True)

        providers = query.offset(skip).limit(limit).all()

        # Build a lightweight list of dicts used by geo lookup (don't mutate DB objects yet)
        provider_dicts = []
        for provider in providers:
            provider_dicts.append(
                {
                    "provider_id": str(provider.provider_id),
                    "location": provider.user.location,
                    "name": provider.user.name,
                    "rating": provider.rating,
                    "services": provider.services,
                    "pricing": provider.pricing,
                    "provider_obj": provider,  # Keep reference to original object
                }
            )

        # Apply geolocation filtering once for the full list if a location was provided
        if location and max_distance_km:
            provider_dicts = await geo_service.find_nearby_providers(
                customer_location=location,
                providers=provider_dicts,
                max_distance_km=max_distance_km,
            )

        # Convert back to original provider objects, attaching distance when available
        result_providers = []
        for provider_dict in provider_dicts:
            provider_obj = provider_dict.get("provider_obj")
            if not provider_obj:
                continue

            if "distance_km" in provider_dict:
                # attach distance to the provider ORM object for downstream sorting/consumption
                setattr(provider_obj, "distance_km", provider_dict["distance_km"])

            result_providers.append(provider_obj)

        return result_providers
