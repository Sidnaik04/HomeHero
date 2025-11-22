from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_customer
from app.schemas.review import ReviewResponse, ReviewCreate, ReviewWithCustomer
from app.controllers.review import ReviewController
from app.models.user import User
from app.services.file_upload import FileUploadService


file_service = FileUploadService()

router = APIRouter()


# submit a review for provider
@router.post("/", response_model=dict)
async def current_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    ReviewController.create_review(db, review_data, str(current_user.id))
    return {"message": "Review submitted"}


# get all reviews for a provider
@router.get("/provider/{provider_id}", response_model=List[ReviewWithCustomer])
async def get_provider_reviews(provider_id: str, db: Session = Depends(get_db)):
    return ReviewController.get_provider_reviews(db, provider_id)


@router.get("/my-reviews", response_model=List[ReviewWithCustomer])
async def get_my_reviews(
    current_user: User = Depends(get_current_customer), db: Session = Depends(get_db)
):
    """Return reviews written by the authenticated customer."""
    return ReviewController.get_customer_reviews(db, str(current_user.id))


# get review by id
@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ReviewController.get_review(db, review_id)


@router.post("/images", response_model=dict)
async def upload_review_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_customer),
):
    """Upload one or more images for reviews and return their URLs.

    Accepts multipart/form-data files and returns a JSON object with an
    `urls` list of uploaded image URLs. No DB changes are made here; the
    frontend should include those URLs in the `images` field when creating
    a review via POST /reviews/.
    """
    try:
        # upload files to cloudinary and return secure urls
        uploaded = await file_service.upload_multiple_images(files, folder="reviews")
        urls = [u.get("url") for u in uploaded]
        return {"urls": urls}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
