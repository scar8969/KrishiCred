"""Custom exceptions for KrishiCred platform."""
from typing import Any, Dict, Optional


class KrishiCredException(Exception):
    """Base exception for all KrishiCred errors."""

    def __init__(
        self,
        message: str,
        code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize exception with message and metadata."""
        self.message = message
        self.code = code or self.__class__.__name__
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API response."""
        return {
            "error": self.code,
            "message": self.message,
            **self.details,
        }


class NotFoundException(KrishiCredException):
    """Exception raised when a resource is not found."""

    def __init__(
        self,
        resource: str,
        identifier: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize not found exception."""
        message = f"{resource} not found"
        if identifier:
            message += f": {identifier}"

        super().__init__(
            message=message,
            code="NOT_FOUND",
            details=details,
        )


class ValidationException(KrishiCredException):
    """Exception raised for validation errors."""

    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize validation exception."""
        error_details = details or {}
        if field:
            error_details["field"] = field

        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            details=error_details,
        )


class AuthenticationException(KrishiCredException):
    """Exception raised for authentication failures."""

    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize authentication exception."""
        super().__init__(
            message=message,
            code="AUTHENTICATION_FAILED",
            details=details,
        )


class AuthorizationException(KrishiCredException):
    """Exception raised for authorization failures."""

    def __init__(
        self,
        message: str = "Access denied",
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize authorization exception."""
        super().__init__(
            message=message,
            code="AUTHORIZATION_FAILED",
            details=details,
        )


class ConflictException(KrishiCredException):
    """Exception raised for resource conflicts."""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize conflict exception."""
        super().__init__(
            message=message,
            code="CONFLICT",
            details=details,
        )


class RateLimitException(KrishiCredException):
    """Exception raised when rate limit is exceeded."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize rate limit exception."""
        error_details = details or {}
        if retry_after:
            error_details["retry_after"] = retry_after

        super().__init__(
            message=message,
            code="RATE_LIMIT_EXCEEDED",
            details=error_details,
        )


class ExternalServiceException(KrishiCredException):
    """Exception raised when external service calls fail."""

    def __init__(
        self,
        service: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize external service exception."""
        error_details = details or {}
        error_details["service"] = service

        super().__init__(
            message=f"{service} error: {message}",
            code="EXTERNAL_SERVICE_ERROR",
            details=error_details,
        )


class SatelliteProcessingException(KrishiCredException):
    """Exception raised during satellite data processing."""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize satellite processing exception."""
        super().__init__(
            message=message,
            code="SATELLITE_PROCESSING_ERROR",
            details=details,
        )


class RoutingException(KrishiCredException):
    """Exception raised during route optimization."""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize routing exception."""
        super().__init__(
            message=message,
            code="ROUTING_ERROR",
            details=details,
        )


class CarbonCreditException(KrishiCredException):
    """Exception raised during credit calculation/verification."""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize carbon credit exception."""
        super().__init__(
            message=message,
            code="CARBON_CREDIT_ERROR",
            details=details,
        )
