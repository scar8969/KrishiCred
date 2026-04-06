"""FireWatch AI API router - Satellite fire detection and alerts."""
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException
from app.db.session import get_db
from app.schemas.fire_alert import (
    FireAlertCreate,
    FireAlertResponse,
    FireAlertListResponse,
    FireAlertStatsResponse,
    FireAlertQueryParams,
    AlertResponse,
)
from app.services.firewatch.detector import FireDetector
from app.services.firewatch.alerting import AlertManager
from app.repositories.fire_alert import FireAlertRepository

router = APIRouter(
    prefix="/firewatch",
    tags=["firewatch"],
    responses={404: {"description": "Not found"}},
)


@router.post("/alerts", response_model=FireAlertResponse, status_code=status.HTTP_201_CREATED)
async def create_fire_alert(
    alert_data: FireAlertCreate,
    db: AsyncSession = Depends(get_db),
) -> FireAlertResponse:
    """
    Create a new fire alert from satellite detection.

    This endpoint is called by the satellite processing pipeline when
    a potential crop residue burning event is detected.
    """
    detector = FireDetector(db)

    # Check for duplicate alerts
    existing = await detector.find_existing_alert(
        satellite_id=alert_data.satellite_id,
        detection_time=alert_data.detection_time,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Alert already exists with ID: {existing.id}",
        )

    # Create the alert
    alert = await detector.create_alert(alert_data)

    # Auto-match with nearby farmers
    await detector.match_nearby_farmers(alert)

    return FireAlertResponse.model_validate(alert)


@router.get("/alerts", response_model=FireAlertListResponse)
async def list_fire_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    source: Optional[str] = None,
    farmer_id: Optional[UUID] = None,
    min_confidence: Optional[float] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
) -> FireAlertListResponse:
    """List fire alerts with filtering and pagination."""
    repo = FireAlertRepository(db)

    params = FireAlertQueryParams(
        status=status,
        source=source,  # type: ignore
        farmer_id=farmer_id,
        min_confidence=min_confidence,
        start_date=start_date,
        end_date=end_date,
    )

    alerts, total = await repo.list_alerts(
        page=page,
        page_size=page_size,
        params=params,
    )

    return FireAlertListResponse(
        items=[FireAlertResponse.model_validate(alert) for alert in alerts],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/alerts/{alert_id}", response_model=FireAlertResponse)
async def get_fire_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> FireAlertResponse:
    """Get details of a specific fire alert."""
    repo = FireAlertRepository(db)
    alert = await repo.get(alert_id)

    if not alert:
        raise NotFoundException("FireAlert", str(alert_id))

    return FireAlertResponse.model_validate(alert)


@router.post("/alerts/{alert_id}/send", response_model=FireAlertResponse)
async def send_farmer_alerts(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> FireAlertResponse:
    """
    Send WhatsApp alerts to farmers near the detected fire.

    This triggers the alerting service to send messages in Punjabi
    to farmers within the alert radius.
    """
    alert_manager = AlertManager(db)

    alert = await alert_manager.send_alerts(alert_id)
    if not alert:
        raise NotFoundException("FireAlert", str(alert_id))

    return FireAlertResponse.model_validate(alert)


@router.post("/alerts/{alert_id}/respond", response_model=FireAlertResponse)
async def record_farmer_response(
    alert_id: UUID,
    response: AlertResponse,
    db: AsyncSession = Depends(get_db),
) -> FireAlertResponse:
    """
    Record farmer's response to fire alert.

    Farmers can respond via WhatsApp to indicate:
    - They will not burn (alert resolved)
    - Already burned (for record)
    - False alarm (not their farm)
    """
    alert_manager = AlertManager(db)

    alert = await alert_manager.record_response(
        alert_id=alert_id,
        farmer_id=response.farmer_id,
        response_type=response.response_type,
        notes=response.notes,
    )

    if not alert:
        raise NotFoundException("FireAlert", str(alert_id))

    return FireAlertResponse.model_validate(alert)


@router.get("/stats", response_model=FireAlertStatsResponse)
async def get_fire_alert_stats(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
) -> FireAlertStatsResponse:
    """Get fire alert statistics for the specified period."""
    repo = FireAlertRepository(db)
    start_date = datetime.utcnow() - timedelta(days=days)

    stats = await repo.get_stats(start_date=start_date)

    return FireAlertStatsResponse(**stats)


@router.post("/process-satellite", status_code=status.HTTP_202_ACCEPTED)
async def trigger_satellite_processing(
    hours_back: int = Query(6, ge=1, le=24),
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger satellite data processing.

    This endpoint initiates background processing of recent satellite
    imagery to detect new fire events.
    """
    from app.tasks.satellite_tasks import process_satellite_data

    # Trigger Celery task
    task = process_satellite_data.delay(hours_back=hours_back)

    return {
        "message": "Satellite processing initiated",
        "task_id": task.id,
        "hours_back": hours_back,
    }


@router.get("/tasks/{task_id}")
async def get_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get status of a background satellite processing task."""
    from app.tasks.celery_app import celery_app

    result = celery_app.AsyncResult(task_id)

    return {
        "task_id": task_id,
        "status": result.state,
        "result": result.result if result.ready() else None,
    }
