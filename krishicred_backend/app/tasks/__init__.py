"""Celery tasks package."""
from app.tasks.celery_app import celery_app, health_check_task
from app.tasks.satellite_tasks import (
    process_satellite_data,
    send_fire_alerts,
    cleanup_old_alerts,
)
from app.tasks.routing_tasks import (
    optimize_all_plant_routes,
    optimize_collection_routes,
    dispatch_routes,
    check_route_completion,
)
from app.tasks.carbon_tasks import (
    process_pending_credits,
    verify_pending_credits,
    aggregate_credits,
    check_credit_expiry,
    generate_certificate,
)
from app.tasks.notification_tasks import (
    send_daily_summary,
    send_collection_reminder,
    send_payment_confirmation,
)

__all__ = [
    "celery_app",
    "health_check_task",
    "process_satellite_data",
    "send_fire_alerts",
    "cleanup_old_alerts",
    "optimize_all_plant_routes",
    "optimize_collection_routes",
    "dispatch_routes",
    "check_route_completion",
    "process_pending_credits",
    "verify_pending_credits",
    "aggregate_credits",
    "check_credit_expiry",
    "generate_certificate",
    "send_daily_summary",
    "send_collection_reminder",
    "send_payment_confirmation",
]
