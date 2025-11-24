"""Convenience exports for models package.

Some places in the codebase import models from the package namespace like
`from app.models import User` or `from app.models import user` (module).
To make those imports robust across platforms and avoid case-sensitivity
issues, explicitly import and expose commonly-used model classes and
submodules here.
"""

from .user import User
from .provider import Provider
from .booking import Booking
from .review import Review
from .service import ServiceCategory
from .chatHistory import ChatHistory

# Also expose the module objects (some migration/env files import the module)
from . import user as user
from . import provider as provider
from . import booking as booking
from . import review as review
from . import service as service

__all__ = [
    "User",
    "Provider",
    "Booking",
    "Review",
    "ServiceCategory",
    "ChatHistory",
    # modules
    "user",
    "provider",
    "booking",
    "review",
    "service",
]
