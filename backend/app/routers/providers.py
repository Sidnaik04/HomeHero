from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
    Query,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
import traceback
from fastapi.responses import JSONResponse

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_provider
from app.core.rate_limiter import limiter, CustomRateLimits
from app.core.logging import get_logger
from app.schemas.provider import (
    ProviderResponse,
    ProviderCreate,
    PricingUpdate,
    PricingUpdate,
    AvailabilityUpdate,
    ProviderWithUser,
    ProviderUpdate,
)
from app.controllers.provider import ProviderController
from app.models.provider import Provider
from app.models.user import User
from app.services.ai_helper import AIHelper
from app.services.file_upload import FileUploadService
from app.services.cache import cache
from app.utils.geo_utils import GeoUtils


class NearbyProvidersRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="User latitude")
    longitude: float = Field(..., ge=-180, le=180, description="User longitude")
    radius_km: Optional[float] = Field(
        10.0, ge=0.1, le=100, description="Search radius in km"
    )
    service_type: Optional[str] = None
    min_rating: Optional[float] = Field(0.0, ge=0, le=5)
    max_price: Optional[float] = None
    availability_only: Optional[bool] = True


class ProviderWithDistance(BaseModel):
    provider_id: str
    name: str
    email: str
    phone: str
    location: str
    services: List[str]
    pricing: float
    rating: float
    experience_years: int
    availability: bool
    latitude: Optional[float]
    longitude: Optional[float]
    distance_km: float
    avatar_url: Optional[str] = None


router = APIRouter()
file_service = FileUploadService()
logger = get_logger("providers")


class CoordinatesUpdate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


# enhanced provider search with geolocation, filtering and sorting
@router.get("/search", response_model=List[ProviderWithUser])
@limiter.limit(CustomRateLimits.search_endpoints())
async def enhanced_provider_search(
    request: Request,
    service: Optional[str] = Query(None, description="Service type to filter by"),
    location: Optional[str] = Query(None, description="Location to search near"),
    max_distance: Optional[float] = Query(
        25.0, ge=1, le=100, description="Maximum distance in km"
    ),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    available_only: bool = Query(True, description="Show only available providers"),
    sort_by: str = Query("distance", description="Sort by: distance, rating, price"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    try:
        providers = await ProviderController.search_providers_with_location(
            db=db,
            service=service,
            location=location,
            min_rating=min_rating,
            max_distance_km=max_distance,
            available_only=available_only,
            skip=skip,
            limit=limit,
        )

        # Handle None return value
        if providers is None:
            logger.warning("Provider search returned None, returning empty list")
            return []

        # Ensure providers is a list
        if not isinstance(providers, list):
            logger.warning(
                f"Provider search returned unexpected type: {type(providers)}"
            )
            return []

        if max_price:
            providers = [p for p in providers if p.pricing and p.pricing <= max_price]

        if sort_by == "rating":
            providers.sort(key=lambda x: x.rating or 0, reverse=True)
        elif sort_by == "price":
            providers.sort(key=lambda x: x.pricing or float("inf"))
        elif sort_by == "distance" and location:
            providers.sort(key=lambda x: getattr(x, "distance_km", float("inf")))

        return providers

    except Exception as e:
        logger.error("Provider search failed", error=str(e))
        # Return empty list instead of raising exception
        return []


# upload portfolio images for provider
@router.post("/portfolio", response_model=dict)
@limiter.limit("10/minute")
async def upload_provider_portfolio(
    request: Request,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    try:
        # upload multiple images
        uploaded_files = await file_service.upload_multiple_images(
            files=files, folder="homehero/portfolios", max_files=10
        )

        # update provider with portfolio urls
        provider = ProviderController.get_provider_by_user(db, str(current_user.id))
        portfolio_urls = [file["url"] for file in uploaded_files]

        # Add existing portfolio
        existing_portfolio = provider.documents or []
        updated_portfolio = existing_portfolio + portfolio_urls

        ProviderController.update_provider(
            db, str(provider.provider_id), ProviderUpdate(documents=updated_portfolio)
        )

        return {
            "message": f"Uploaded {len(uploaded_files)} images successfully",
            "uploaded_files": uploaded_files,
            "total_portfolio_images": len(updated_portfolio),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Portfolio upload failed: {str(e)}",
        )


# create provider profile
@router.post("/", response_model=ProviderResponse)
async def create_provider_profile(
    provider_data: ProviderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.user_type != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only provider accounts can create provider profiles",
        )

    return ProviderController.create_provider(db, provider_data, str(current_user.id))


# Search providers by service and location
@router.get("/", response_model=List[ProviderWithUser])
async def search_providers(
    service: Optional[str] = Query(None, description="Service type to filter by"),
    location: Optional[str] = Query(None, description="Location to filter by"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    available_only: bool = Query(True, description="Show only available providers"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    providers = ProviderController.search_provider(
        db, service, location, min_rating, available_only, skip, limit
    )

    return providers


# current user's provider profile
@router.get("/me", response_model=ProviderResponse)
async def get_my_provider_profile(
    current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)
):
    return ProviderController.get_provider_by_user(db, str(current_user.id))


# Update current user's provider profile
@router.put("/me", response_model=ProviderResponse)
async def update_my_provider_profile(
    provider_data: ProviderUpdate,
    current_user: User = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    provider = ProviderController.get_provider_by_user(db, str(current_user.id))
    return ProviderController.update_provider(
        db, str(provider.provider_id), provider_data
    )


# get provider profile using id (only matches UUIDs)


# update service pricing
@router.put("/pricing", response_model=dict)
async def update_pricing(
    pricing_data: PricingUpdate,
    current_user: User = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    provider = ProviderController.get_provider_by_user(db, str(current_user.id))
    ProviderController.update_provider(
        db, str(provider.provider_id), ProviderUpdate(pricing=pricing_data.pricing)
    )
    return {"message": "Pricing updated"}


# toggle provider avaibility
@router.put("/availability", response_model=dict)
async def update_availability(
    availability_data: AvailabilityUpdate,
    current_user: User = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    provider = ProviderController.get_provider_by_user(db, str(current_user.id))
    ProviderController.update_provider(
        db,
        str(provider.provider_id),
        ProviderUpdate(availability=availability_data.available),
    )
    return {"message": "Availability updated"}


# service suggestions
@router.get("/suggest/{query}")
async def get_service_suggestions(query: str):
    suggestions = AIHelper.get_smart_suggestions(query)
    return suggestions


@router.get("/nearby")
def get_nearby_providers(
    lat: float,
    lng: float,
    radius: float = 10.0,
    service: Optional[str] = None,
    min_rating: float = 0.0,
    max_price: Optional[float] = None,
    available_only: bool = True,
    db: Session = Depends(get_db),
):
    logger.info(
        f"get_nearby_providers called with lat={lat}, lng={lng}, radius={radius}, service={service}, min_rating={min_rating}, max_price={max_price}, available_only={available_only}"
    )

    try:
        # validate coordinates
        if not GeoUtils.validate_coordinates(lat, lng):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid coordinates"
            )

        # limit radius
        if radius > 100:
            radius = 100

        # Get bounding box for efficient filtering
        min_lat, max_lat, min_lon, max_lon = GeoUtils.get_bounding_box(lat, lng, radius)

        # Build query
        query = (
            db.query(Provider)
            .join(User)
            .filter(
                Provider.approved == True,
                Provider.latitude.isnot(None),
                Provider.longitude.isnot(None),
                Provider.latitude.between(min_lat, max_lat),
                Provider.longitude.between(min_lon, max_lon),
            )
        )

        # Apply filters
        if service:
            query = query.filter(Provider.services.contains([service]))

        if min_rating > 0:
            query = query.filter(Provider.rating >= min_rating)

        if max_price:
            query = query.filter(Provider.pricing <= max_price)

        if available_only:
            query = query.filter(Provider.availability == True)

        providers = query.all()

        # calculate distances and filter by radius
        results = []
        for provider in providers:
            distance = GeoUtils.haversine_distance(
                lat, lng, provider.latitude, provider.longitude
            )

            # only inlcude if within radius
            if distance <= radius:
                results.append(
                    {
                        "provider_id": str(provider.provider_id),
                        "name": provider.user.name,
                        "email": provider.user.email,
                        "phone": provider.user.phone,
                        "location": provider.user.location,
                        "services": provider.services,
                        "pricing": float(provider.pricing),
                        "rating": float(provider.rating),
                        "experience_years": provider.experience_years,
                        "availability": provider.availability,
                        "latitude": provider.latitude,
                        "longitude": provider.longitude,
                        "distance_km": round(distance, 2),
                        "avatar_url": provider.user.avatar_url,
                    }
                )

        # sort by distance
        results.sort(key=lambda x: x["distance_km"])

        return {
            "center": {"latitude": lat, "longitude": lng},
            "radius_km": radius,
            "total_found": len(results),
            "providers": results,
        }

    except HTTPException:
        raise
    except Exception as e:
        # Log full traceback for easier debugging
        logger.exception("Failed to search nearby providers")
        tb = traceback.format_exc()
        # Return JSON response so browser receives content-type application/json
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "FailedToSearchNearbyProviders",
                "message": str(e),
                "traceback": tb,
            },
        )


# get provider profile using id (only matches UUIDs)
@router.get("/{provider_id}", response_model=ProviderWithUser)
async def get_provider_profile(provider_id: UUID, db: Session = Depends(get_db)):
    # provider_id is a UUID type; convert to string for controller
    return ProviderController.get_provider(db, str(provider_id))


@router.put("/me/coordinates")
def update_provider_coordinates(
    coords: CoordinatesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update provider coordinates"""
    if current_user.user_type != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can update coordinates",
        )

    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found"
        )
    provider.latitude = coords.latitude
    provider.longitude = coords.longitude
    db.commit()

    return {
        "message": "Coordinates updated successfully",
        "latitude": coords.latitude,
        "longitude": coords.longitude,
    }
