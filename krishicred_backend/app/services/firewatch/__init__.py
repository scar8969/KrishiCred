"""FireWatch services package."""
from app.services.firewatch.detector import FireDetector
from app.services.firewatch.alerting import AlertManager

__all__ = ["FireDetector", "AlertManager"]
