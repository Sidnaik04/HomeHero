import math
from typing import Tuple


class GeoUtils:
    "utility class for geographic calculations"

    EARTH_RADIUS_KM = 6378.0  # earth's radius in km

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points on Earth using Haversine formula
        Args:
            lat1, lon1: Latitude and longitude of point 1
            lat2, lon2: Latitude and longitude of point 2
        Returns:
            Distance in kilometers
        """

        # convert latitude and longitude to radians
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        lon1_rad = math.radians(lon1)
        lon2_rad = math.radians(lon2)

        # Haversine Formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon2_rad

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))

        distance = GeoUtils.EARTH_RADIUS_KM * c

        return distance

    @staticmethod
    def is_within_radius(
        lat1: float, lon1: float, lat2: float, lon2: float, radius_km: float
    ) -> bool:
        """
        Check if point 2 is within specified radius of point 1

        Args:
            lat1, lon1: Center point coordinates
            lat2, lon2: Point to check
            radius_km: Radius in kilometers

        Returns:
            True if within radius, False otherwise
        """
        distance = GeoUtils.haversine_distance(lat1, lon1, lat2, lon2)
        return distance <= radius_km

    @staticmethod
    def get_bounding_box(
        lat: float, lon: float, radius_km: float
    ) -> Tuple[float, float, float, float]:
        """
        Calculate bounding box for a circle

        Args:
            lat, lon: Center point
            radius_km: Radius in kilometers

        Returns:
            Tuple of (min_lat, max_lat, min_lon, max_lon)
        """
        # Approximate degrees per kilometer
        lat_degree = radius_km / 111.0
        lon_degree = radius_km / (111.0 * math.cos(math.radians(lat)))

        min_lat = lat - lat_degree
        max_lat = lat + lat_degree
        min_lon = lon - lon_degree
        max_lon = lon + lon_degree

        return (min_lat, max_lat, min_lon, max_lon)

    @staticmethod
    def validate_coordinates(lat: float, lon: float) -> bool:
        """
        Validate latitude and longitude values

        Args:
            lat: Latitude
            lon: Longitude
        Returns:
            True if valid, False otherwise
        """
        return -90 <= lat <= 90 and -180 <= lon <= 180
