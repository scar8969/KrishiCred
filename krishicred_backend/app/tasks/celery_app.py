"""Celery application configuration and initialization."""
from datetime import timedelta

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

# Create Celery app
celery_app = Celery(
    "krishicred",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Configure Celery
celery_app.conf.update(
    # Task settings
    task_track_started=settings.CELERY_TASK_TRACK_STARTED,
    task_time_limit=settings.CELERY_TASK_TIME_LIMIT,
    task_soft_time_limit=settings.CELERY_TASK_TIME_LIMIT - 60,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,

    # Result backend
    result_extended=True,
    result_expires=timedelta(hours=24).total_seconds(),

    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    # Timezone
    timezone="Asia/Kolkata",
    enable_utc=True,

    # Task routing
    task_routes={
        "app.tasks.satellite_tasks.*": {"queue": "satellite"},
        "app.tasks.routing_tasks.*": {"queue": "routing"},
        "app.tasks.carbon_tasks.*": {"queue": "carbon"},
        "app.tasks.notification_tasks.*": {"queue": "notifications"},
    },

    # Beat schedule (periodic tasks)
    beat_schedule={
        # Process satellite data every 6 hours during burning season (Oct-Nov)
        "process-satellite-data": {
            "task": "app.tasks.satellite_tasks.process_satellite_data",
            "schedule": crontab(hour="*/6", minute=0),
            "options": {"queue": "satellite"},
        },
        # Optimize routes daily at 6 AM
        "optimize-daily-routes": {
            "task": "app.tasks.routing_tasks.optimize_all_plant_routes",
            "schedule": crontab(hour=6, minute=0),
            "options": {"queue": "routing"},
        },
        # Calculate pending carbon credits hourly
        "calculate-pending-credits": {
            "task": "app.tasks.carbon_tasks.process_pending_credits",
            "schedule": crontab(minute=0),
            "options": {"queue": "carbon"},
        },
        # Clean up old alerts daily at midnight
        "cleanup-old-alerts": {
            "task": "app.tasks.satellite_tasks.cleanup_old_alerts",
            "schedule": crontab(hour=0, minute=0),
            "options": {"queue": "satellite"},
        },
        # Send daily summary at 8 PM
        "daily-summary": {
            "task": "app.tasks.notification_tasks.send_daily_summary",
            "schedule": crontab(hour=20, minute=0),
            "options": {"queue": "notifications"},
        },
    },
)

# Auto-discover tasks in all modules
celery_app.autodiscover_tasks(["app.tasks"])


# Health check task
@celery_app.task(bind=True, name="health_check")
def health_check_task(self):
    """Simple health check task."""
    return {"status": "healthy", "task_id": self.request.id}
