"""Logging configuration for KrishiCred platform."""
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import orjson
from pythonjsonlogger import jsonlogger

from app.core.config import get_settings


class JsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional context."""

    def add_fields(
        self,
        log_record: dict,
        record: logging.LogRecord,
        message_dict: dict,
    ) -> None:
        """Add custom fields to log record."""
        super().add_fields(log_record, record, message_dict)

        # Add standard fields
        log_record["timestamp"] = datetime.utcnow().isoformat()
        log_record["level"] = record.levelname
        log_record["logger"] = record.name
        log_record["module"] = record.module
        log_record["function"] = record.funcName
        log_record["line"] = record.lineno

        # Add application context
        settings = get_settings()
        log_record["app"] = settings.APP_NAME
        log_record["environment"] = settings.ENVIRONMENT

        # Add exception info if present
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)


class TextFormatter(logging.Formatter):
    """Colored text formatter for development."""

    COLORS = {
        "DEBUG": "\033[36m",    # Cyan
        "INFO": "\033[32m",     # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",    # Red
        "CRITICAL": "\033[35m", # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors."""
        color = self.COLORS.get(record.levelname, "")
        levelname = f"{color}{record.levelname}{self.RESET}"

        return (
            f"{datetime.utcnow().isoformat()} | "
            f"{levelname:8} | "
            f"{record.name}:{record.funcName}:{record.lineno} | "
            f"{record.getMessage()}"
        )


def setup_logging() -> logging.Logger:
    """Configure application logging."""
    settings = get_settings()

    # Get root logger
    logger = logging.getLogger("krishicred")
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))

    # Remove existing handlers
    logger.handlers.clear()

    # Select formatter based on environment
    if settings.ENVIRONMENT == "production" or settings.LOG_FORMAT == "json":
        formatter = JsonFormatter(
            "%(timestamp)s %(level)s %(logger)s %(message)s"
        )
    else:
        formatter = TextFormatter()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler in production
    if settings.ENVIRONMENT == "production":
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        file_handler = logging.FileHandler(
            log_dir / f"krishicred_{datetime.utcnow().strftime('%Y%m%d')}.log"
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(f"krishicred.{name}")


class LogContext:
    """Context manager for adding temporary log context."""

    def __init__(self, logger: logging.Logger, **context: Any):
        """Initialize with logger and context data."""
        self.logger = logger
        self.context = context
        self.old_factory = None

    def __enter__(self) -> "LogContext":
        """Add context to log records."""
        self.old_factory = self.logger.makeRecord

        def record_factory(*args, **kwargs):
            record = self.old_factory(*args, **kwargs)
            for key, value in self.context.items():
                setattr(record, key, value)
            return record

        self.logger.makeRecord = record_factory
        return self

    def __exit__(self, *args) -> None:
        """Restore original record factory."""
        self.logger.makeRecord = self.old_factory
