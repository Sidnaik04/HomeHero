from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # database
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"

    # security & jwt
    SECRET_KEY: str = "falback-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600

    # environment
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    PORT: int = 10000

    # Cloudinary:
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Payment gateways
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None

    # Notifications
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM_EMAIL: Optional[str] = None

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    
    GEMINI_API_KEY: str = "api-key-gemini"

    class Config:
        env_file = ".env"


settings = Settings()
