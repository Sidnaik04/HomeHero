from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.provider import Provider
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class QueryParser:

    SERVICE_KEYWORDS = {
        "plumber": ["plumber", "plumbing", "pipe", "leak", "tap", "water", "drain"],
        "electrician": [
            "electrician",
            "electric",
            "wiring",
            "switch",
            "light",
            "power",
            "voltage",
        ],
        "carpenter": ["carpenter", "wood", "furniture", "door", "window", "cabinet"],
        "cleaner": ["clean", "cleaning", "maid", "housekeeping", "sanitize"],
        "painter": ["painter", "paint", "wall", "color", "coating"],
        "appliance_repair": ["repair", "appliance", "fridge", "ac", "washing machine"],
        "pest_control": ["pest", "termite", "cockroach", "rats", "insects"],
        "gardening": ["garden", "lawn", "plants", "landscaping"],
    }

    LOCATION_KEYWORDS = {
        "panaji": ["panaji", "panjim"],
        "margao": ["margao", "madgaon"],
        "calangute": ["calangute"],
        "mapusa": ["mapusa"],
        "vasco da gama": ["vasco", "vasco da gama"],
        "baga": ["baga"],
    }

    @staticmethod
    def detect_service(message: str) -> Optional[str]:
        message_lower = message.lower()

        for service, keywords in QueryParser.SERVICE_KEYWORDS.items():
            if any(keyword in message_lower for keyword in keywords):
                return service

        return None

    @staticmethod
    def detect_location(message: str) -> Optional[str]:
        message_lower = message.lower()

        for location, keywords in QueryParser.LOCATION_KEYWORDS.items():
            if any(keyword in message_lower for keyword in keywords):
                return location.title()

        return None

    @staticmethod
    def detect_budget(message: str) -> Optional[int]:

        import re

        # Look for patterns like "under 500", "below 1000", "₹500"
        patterns = [
            r"under\s+(\d+)",
            r"below\s+(\d+)",
            r"less\s+than\s+(\d+)",
            r"₹\s*(\d+)",
            r"rs\.?\s*(\d+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, message.lower())
            if match:
                return int(match.group(1))

        return None

    @staticmethod
    def detect_urgency(message: str) -> str:
        urgent_keywords = ["urgent", "emergency", "asap", "immediately", "now", "today"]
        message_lower = message.lower()

        if any(keyword in message_lower for keyword in urgent_keywords):
            return "urgent"

        return "flexible"

    @staticmethod
    def search_providers(
        db: Session,
        service_type: Optional[str] = None,
        location: Optional[str] = None,
        max_budget: Optional[int] = None,
        min_rating: float = 0.0,
    ) -> List[Dict[str, Any]]:

        try:
            query = (
                db.query(Provider)
                .join(User)
                .filter(Provider.availability == True, Provider.approved == True)
            )

            # filter by service
            if service_type:
                query = query.filter(Provider.services.contains([service_type]))

            # Filter by location - accept synonyms and be case-insensitive
            if location:
                # normalized location lowercase
                loc_lower = location.lower()
                # find synonyms from LOCATION_KEYWORDS (if any)
                synonyms = [loc_lower]
                for key, kws in QueryParser.LOCATION_KEYWORDS.items():
                    if key == loc_lower or loc_lower in [k.lower() for k in kws]:
                        synonyms = list(set([key] + [k.lower() for k in kws]))
                        break

                # build ilike OR conditions for all synonyms
                from sqlalchemy import or_

                ilike_conditions = [
                    User.location.ilike(f"%{s.title()}%") for s in synonyms
                ]
                # also include plain lowercase match in case stored differently
                ilike_conditions += [User.location.ilike(f"%{s}%") for s in synonyms]

                query = query.filter(or_(*ilike_conditions))

            # Filter by budget
            if max_budget:
                query = query.filter(Provider.pricing <= max_budget)

            # Filter by rating
            if min_rating > 0:
                query = query.filter(Provider.rating >= min_rating)

            # Sort by rating
            query = query.order_by(Provider.rating.desc())

            providers = query.limit(10).all()

            # format results
            results = []
            for p in providers:
                results.append(
                    {
                        "provider_id": str(p.provider_id),
                        "name": p.user.name,
                        "email": p.user.email,
                        "phone": p.user.phone,
                        "location": p.user.location,
                        "services": p.services,
                        "pricing": float(p.pricing),
                        "rating": float(p.rating),
                        "experience_years": p.experience_years,
                        "availability": p.availability,
                    }
                )

            return results

        except Exception as e:
            logger.exception(f"Provider search error: {e}")
            return []
