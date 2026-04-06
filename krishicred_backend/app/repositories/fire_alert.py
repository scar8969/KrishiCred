"""Repository for FireAlert database operations."""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.fire_alert import FireAlert, AlertSource, AlertStatus
from app.schemas.fire_alert import FireAlertQueryParams


class FireAlertRepository:
    """Repository for FireAlert model operations."""

    def __init__(self, db: AsyncSession):
        """Initialize repository with database session."""
        self.db = db

    async def get(self, alert_id: UUID) -> Optional[FireAlert]:
        """Get a fire alert by ID."""
        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.id == alert_id)
            .options(selectinload(FireAlert.farmer))
        )
        return result.scalar_one_or_none()

    async def create(self, alert_data: dict[str, Any]) -> FireAlert:
        """Create a new fire alert."""
        alert = FireAlert(**alert_data)
        self.db.add(alert)
        await self.db.commit()
        await self.db.refresh(alert)
        return alert

    async def update(
        self,
        alert_id: UUID,
        update_data: dict[str, Any],
    ) -> Optional[FireAlert]:
        """Update a fire alert."""
        result = await self.db.execute(
            update(FireAlert)
            .where(FireAlert.id == alert_id)
            .values(**update_data)
            .returning(FireAlert)
        )
        await self.db.commit()

        alert = result.scalar_one_or_none()
        if alert:
            await self.db.refresh(alert)
        return alert

    async def delete(self, alert_id: UUID) -> bool:
        """Delete a fire alert."""
        result = await self.db.execute(
            select(FireAlert).where(FireAlert.id == alert_id)
        )
        alert = result.scalar_one_or_none()

        if alert:
            await self.db.delete(alert)
            await self.db.commit()
            return True
        return False

    async def list_alerts(
        self,
        page: int = 1,
        page_size: int = 20,
        params: Optional[FireAlertQueryParams] = None,
    ) -> tuple[list[FireAlert], int]:
        """List fire alerts with filtering and pagination."""
        params = params or FireAlertQueryParams()

        # Build base query
        query = select(FireAlert).options(selectinload(FireAlert.farmer))

        # Apply filters
        if params.status:
            query = query.where(FireAlert.status == params.status)
        if params.source:
            query = query.where(FireAlert.source == params.source)
        if params.farmer_id:
            query = query.where(FireAlert.farmer_id == params.farmer_id)
        if params.min_confidence is not None:
            query = query.where(FireAlert.confidence >= params.min_confidence)
        if params.start_date:
            query = query.where(FireAlert.detection_time >= params.start_date)
        if params.end_date:
            query = query.where(FireAlert.detection_time <= params.end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(FireAlert.detection_time.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        alerts = list(result.scalars().all())

        return alerts, total

    async def get_stats(
        self,
        start_date: Optional[datetime] = None,
    ) -> dict[str, Any]:
        """Get fire alert statistics."""
        cutoff = start_date or datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        # Total alerts in period
        total_result = await self.db.execute(
            select(func.count()).where(FireAlert.created_at >= cutoff)
        )
        total_alerts = total_result.scalar() or 0

        # Alerts by source
        source_result = await self.db.execute(
            select(FireAlert.source, func.count())
            .where(FireAlert.created_at >= cutoff)
            .group_by(FireAlert.source)
        )
        by_source = {source.value: count for source, count in source_result.all()}

        # Alerts by status
        status_result = await self.db.execute(
            select(FireAlert.status, func.count())
            .where(FireAlert.created_at >= cutoff)
            .group_by(FireAlert.status)
        )
        by_status = {status.value: count for status, count in status_result.all()}

        # High confidence alerts
        high_conf_result = await self.db.execute(
            select(func.count()).where(
                FireAlert.created_at >= cutoff,
                FireAlert.confidence >= 80,
            )
        )
        high_confidence_alerts = high_conf_result.scalar() or 0

        # Alerts sent
        alerts_sent_result = await self.db.execute(
            select(func.count()).where(
                FireAlert.created_at >= cutoff,
                FireAlert.alert_sent == True,
            )
        )
        alerts_sent = alerts_sent_result.scalar() or 0

        # Resolved alerts
        resolved_result = await self.db.execute(
            select(func.count()).where(
                FireAlert.created_at >= cutoff,
                FireAlert.status == AlertStatus.RESOLVED,
            )
        )
        resolved_alerts = resolved_result.scalar() or 0

        # Calculate today and this week
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = week_start.replace(day=week_start.day - 7)

        today_result = await self.db.execute(
            select(func.count()).where(FireAlert.created_at >= today_start)
        )
        alerts_today = today_result.scalar() or 0

        week_result = await self.db.execute(
            select(func.count()).where(FireAlert.created_at >= week_start)
        )
        alerts_this_week = week_result.scalar() or 0

        return {
            "total_alerts": total_alerts,
            "alerts_today": alerts_today,
            "alerts_this_week": alerts_this_week,
            "high_confidence_alerts": high_confidence_alerts,
            "alerts_sent": alerts_sent,
            "farmers_alerted": alerts_sent,  # Approximate
            "resolved_alerts": resolved_alerts,
            "false_positives": by_status.get("false_alarm", 0),
            "by_source": by_source,
            "by_status": by_status,
        }

    async def get_recent_active(
        self,
        hours: int = 24,
    ) -> list[FireAlert]:
        """Get recent active fire alerts."""
        from datetime import timedelta

        cutoff = datetime.utcnow() - timedelta(hours=hours)

        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.detection_time >= cutoff)
            .where(
                FireAlert.status.in_([
                    AlertStatus.DETECTED,
                    AlertStatus.ALERTING,
                ])
            )
            .order_by(FireAlert.detection_time.desc())
            .options(selectinload(FireAlert.farmer))
        )
        return list(result.scalars().all())

    async def find_by_satellite_id(
        self,
        satellite_id: str,
    ) -> Optional[FireAlert]:
        """Find alert by satellite ID."""
        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.satellite_id == satellite_id)
            .options(selectinload(FireAlert.farmer))
        )
        return result.scalar_one_or_none()

    async def find_nearby_farmers(
        self,
        latitude: float,
        longitude: float,
        radius_km: int = 5,
        limit: int = 10,
    ) -> list[Any]:
        """Find farmers near a location."""
        from app.models.farmer import Farmer
        from app.utils.geo import find_nearby_farmers

        return await find_nearby_farmers(
            self.db,
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            limit=limit,
        )
