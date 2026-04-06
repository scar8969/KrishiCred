"""Carbon credit verification service."""
import logging
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.exceptions import CarbonCreditException, ValidationException
from app.core.logging import get_logger
from app.models.carbon_credit import CarbonCredit, CreditStatus, VerificationLevel

settings = get_settings()
logger = get_logger(__name__)


class CreditVerifier:
    """
    Service for verifying and certifying carbon credits.

    Handles the verification workflow from pending to certified status.
    """

    def __init__(self, db: AsyncSession):
        """Initialize verifier with database session."""
        self.db = db

    async def verify(
        self,
        credit_id: UUID,
        level: VerificationLevel,
        verifier: str,
        certificate_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> CarbonCredit:
        """
        Verify a carbon credit.

        Args:
            credit_id: UUID of the credit to verify
            level: Verification level achieved
            verifier: Name of verifying organization/person
            certificate_id: Optional certificate ID
            notes: Optional verification notes

        Returns:
            Updated CarbonCredit instance
        """
        result = await self.db.execute(
            select(CarbonCredit)
            .options(selectinload(CarbonCredit.plant))
            .options(selectinload(CarbonCredit.route))
            .where(CarbonCredit.id == credit_id)
        )
        credit = result.scalar_one_or_none()

        if not credit:
            raise CarbonCreditException(f"Credit {credit_id} not found")

        if not credit.is_verifiable:
            raise ValidationException(
                f"Credit {credit_id} is not in verifiable state (status: {credit.status})"
            )

        # Update verification status
        credit.mark_verified(
            level=level,
            verifier=verifier,
            certificate_id=certificate_id,
        )

        if notes:
            credit.metadata["verification_notes"] = notes

        await self.db.commit()
        await self.db.refresh(credit)

        logger.info(
            f"Verified credit {credit.credit_code} at level {level.value} "
            f"by {verifier}"
        )

        return credit

    async def certify(
        self,
        credit_id: UUID,
        certificate_url: str,
        certificate_id: str,
        expiry_years: int = 5,
    ) -> CarbonCredit:
        """
        Certify a carbon credit.

        Certification allows credits to be sold on carbon markets.

        Args:
            credit_id: UUID of the credit to certify
            certificate_url: URL to verification certificate
            certificate_id: Certificate identifier
            expiry_years: Years until certificate expires

        Returns:
            Updated CarbonCredit instance
        """
        result = await self.db.execute(
            select(CarbonCredit).where(CarbonCredit.id == credit_id)
        )
        credit = result.scalar_one_or_none()

        if not credit:
            raise CarbonCreditException(f"Credit {credit_id} not found")

        if credit.status != CreditStatus.VERIFIED:
            raise ValidationException(
                f"Credit {credit_id} must be verified before certification"
            )

        # Mark as certified
        credit.mark_certified(
            certificate_url=certificate_url,
            expiry_years=expiry_years,
        )
        credit.certificate_id = certificate_id

        await self.db.commit()
        await self.db.refresh(credit)

        logger.info(f"Certified credit {credit.credit_code}")

        return credit

    async def batch_verify(
        self,
        credit_ids: list[UUID],
        level: VerificationLevel,
        verifier: str,
    ) -> dict[str, any]:
        """
        Verify multiple credits in batch.

        Args:
            credit_ids: List of credit UUIDs to verify
            level: Verification level
            verifier: Verifying organization

        Returns:
            Dict with verification results
        """
        results = {
            "total": len(credit_ids),
            "verified": 0,
            "failed": 0,
            "errors": [],
        }

        for credit_id in credit_ids:
            try:
                await self.verify(
                    credit_id=credit_id,
                    level=level,
                    verifier=verifier,
                )
                results["verified"] += 1

            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "credit_id": str(credit_id),
                    "error": str(e),
                })

        logger.info(f"Batch verification complete: {results}")
        return results

    async def get_pending_verification(
        self,
        days_threshold: int = 90,
    ) -> list[CarbonCredit]:
        """
        Get credits ready for verification.

        Credits that have passed the verification period threshold.
        """
        cutoff = datetime.utcnow() - timedelta(days=days_threshold)

        result = await self.db.execute(
            select(CarbonCredit)
            .where(CarbonCredit.status == CreditStatus.CALCULATED)
            .where(CarbonCredit.created_at <= cutoff)
            .order_by(CarbonCredit.created_at.asc())
        )

        return list(result.scalars().all())

    async def verify_eligible_credits(
        self,
        level: VerificationLevel,
        verifier: str,
    ) -> list[CarbonCredit]:
        """
        Verify all credits that meet the threshold.

        Args:
            level: Verification level to apply
            verifier: Verifying organization

        Returns:
            List of verified credits
        """
        pending = await self.get_pending_verification(
            days_threshold=settings.CREDIT_VERIFICATION_PERIOD_DAYS
        )

        verified = []
        for credit in pending:
            try:
                verified_credit = await self.verify(
                    credit_id=credit.id,
                    level=level,
                    verifier=verifier,
                )
                verified.append(verified_credit)

            except Exception as e:
                logger.error(f"Failed to verify credit {credit.id}: {e}")

        logger.info(f"Verified {len(verified)} of {len(pending)} eligible credits")
        return verified

    async def audit_credit(
        self,
        credit_id: UUID,
        auditor: str,
        audit_data: dict,
    ) -> CarbonCredit:
        """
        Perform audit on a carbon credit.

        Adds audit trail and may change verification status.
        """
        result = await self.db.execute(
            select(CarbonCredit).where(CarbonCredit.id == credit_id)
        )
        credit = result.scalar_one_or_none()

        if not credit:
            raise CarbonCreditException(f"Credit {credit_id} not found")

        # Add audit to metadata
        if "audits" not in credit.metadata:
            credit.metadata["audits"] = []

        credit.metadata["audits"].append({
            "auditor": auditor,
            "timestamp": datetime.utcnow().isoformat(),
            "findings": audit_data.get("findings", ""),
            "status": audit_data.get("status", "passed"),
            "notes": audit_data.get("notes", ""),
        })

        # Update verification level if audit passes
        if audit_data.get("status") == "passed":
            new_level = VerificationLevel.THIRD_PARTY
            await self.verify(
                credit_id=credit_id,
                level=new_level,
                verifier=f"{auditor} (Audit)",
            )

        await self.db.commit()
        await self.db.refresh(credit)

        return credit

    async def get_expiring_credits(
        self,
        expiry_threshold: datetime,
    ) -> list[CarbonCredit]:
        """
        Get credits that will expire soon.

        Args:
            expiry_threshold: Expiry date threshold

        Returns:
            List of credits approaching expiry
        """
        result = await self.db.execute(
            select(CarbonCredit)
            .where(CarbonCredit.status == CreditStatus.CERTIFIED)
            .where(CarbonCredit.expiry_date <= expiry_threshold)
            .order_by(CarbonCredit.expiry_date.asc())
        )

        return list(result.scalars().all())

    async def renew_credit(
        self,
        credit_id: UUID,
        additional_years: int = 1,
    ) -> CarbonCredit:
        """
        Extend certificate validity for a credit.

        Args:
            credit_id: UUID of the credit
            additional_years: Years to add to expiry

        Returns:
            Updated CarbonCredit
        """
        result = await self.db.execute(
            select(CarbonCredit).where(CarbonCredit.id == credit_id)
        )
        credit = result.scalar_one_or_none()

        if not credit:
            raise CarbonCreditException(f"Credit {credit_id} not found")

        if not credit.expiry_date:
            raise ValidationException("Credit has no expiry date")

        from dateutil.relativedelta import relativedelta
        credit.expiry_date += relativedelta(years=additional_years)

        # Add renewal to metadata
        if "renewals" not in credit.metadata:
            credit.metadata["renewals"] = []

        credit.metadata["renewals"].append({
            "date": datetime.utcnow().isoformat(),
            "additional_years": additional_years,
        })

        await self.db.commit()
        await self.db.refresh(credit)

        logger.info(f"Renewed credit {credit.credit_code} by {additional_years} years")

        return credit
