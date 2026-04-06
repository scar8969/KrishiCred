"""CarbonLedger API router - Credit calculation and verification."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException
from app.db.session import get_db
from app.schemas.carbon_credit import (
    CarbonCreditCreate,
    CarbonCreditUpdate,
    CarbonCreditResponse,
    CarbonCreditListResponse,
    CarbonCreditCalculation,
    CarbonCreditCalculationResponse,
    CreditVerificationRequest,
    CreditCertificationRequest,
    CreditSaleRequest,
    CreditSaleResponse,
    TransactionResponse,
    CarbonCreditStatsResponse,
    CreditQueryParams,
)
from app.services.carbon.calculator import CreditCalculator
from app.services.carbon.verifier import CreditVerifier
from app.services.carbon.monetizer import CreditMonetizer
from app.repositories.carbon_credit import CarbonCreditRepository

router = APIRouter(
    prefix="/carbon",
    tags=["carbon"],
    responses={404: {"description": "Not found"}},
)


@router.post("/calculate", response_model=CarbonCreditCalculationResponse)
async def calculate_credits(
    calculation: CarbonCreditCalculation,
) -> CarbonCreditCalculationResponse:
    """
    Calculate carbon credits from stubble quantity.

    Returns the estimated CO2e averted and credit amount.
    """
    calculator = CreditCalculator()

    result = calculator.calculate(
        stubble_tons=calculation.stubble_tons,
        co2e_per_ton=calculation.co2e_per_ton,
        conversion_efficiency=calculation.conversion_efficiency,
    )

    # Estimate value based on configured price
    from app.core.config import get_settings
    settings = get_settings()
    estimated_value = result["credit_amount"] * settings.CREDIT_PRICE_PER_TON_INR

    return CarbonCreditCalculationResponse(
        stubble_tons=result["stubble_tons"],
        co2e_averted_tons=result["co2e_averted_tons"],
        credit_amount=result["credit_amount"],
        estimated_value_inr=estimated_value,
    )


@router.post("/credits", response_model=CarbonCreditResponse, status_code=status.HTTP_201_CREATED)
async def create_credit(
    credit_data: CarbonCreditCreate,
    db: AsyncSession = Depends(get_db),
) -> CarbonCreditResponse:
    """
    Create a new carbon credit.

    Credits are typically created automatically when routes are completed.
    """
    calculator = CreditCalculator(db)

    credit = await calculator.create_credit(credit_data)

    return CarbonCreditResponse.model_validate(credit)


@router.get("/credits", response_model=CarbonCreditListResponse)
async def list_credits(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    plant_id: Optional[UUID] = None,
    verification_level: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
) -> CarbonCreditListResponse:
    """List carbon credits with filtering and pagination."""
    repo = CarbonCreditRepository(db)

    params = CreditQueryParams(
        status=status,  # type: ignore
        plant_id=plant_id,
        verification_level=verification_level,  # type: ignore
        date_from=date_from,
        date_to=date_to,
    )

    credits, total = await repo.list_credits(
        page=page,
        page_size=page_size,
        params=params,
    )

    return CarbonCreditListResponse(
        items=[CarbonCreditResponse.model_validate(c) for c in credits],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/credits/{credit_id}", response_model=CarbonCreditResponse)
async def get_credit(
    credit_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> CarbonCreditResponse:
    """Get details of a specific carbon credit."""
    repo = CarbonCreditRepository(db)
    credit = await repo.get(credit_id)

    if not credit:
        raise NotFoundException("CarbonCredit", str(credit_id))

    return CarbonCreditResponse.model_validate(credit)


@router.patch("/credits/{credit_id}/verify", response_model=CarbonCreditResponse)
async def verify_credit(
    credit_id: UUID,
    verification_data: CreditVerificationRequest,
    db: AsyncSession = Depends(get_db),
) -> CarbonCreditResponse:
    """
    Verify a carbon credit.

    Third-party verification is required before credits can be certified
    and sold on carbon markets.
    """
    verifier = CreditVerifier(db)

    credit = await verifier.verify(
        credit_id=credit_id,
        level=verification_data.verification_level,
        verifier=verification_data.verifier_name,
        certificate_id=None,
        notes=verification_data.notes,
    )

    if not credit:
        raise NotFoundException("CarbonCredit", str(credit_id))

    return CarbonCreditResponse.model_validate(credit)


@router.patch("/credits/{credit_id}/certify", response_model=CarbonCreditResponse)
async def certify_credit(
    credit_id: UUID,
    certification_data: CreditCertificationRequest,
    db: AsyncSession = Depends(get_db),
) -> CarbonCreditResponse:
    """
    Certify a carbon credit.

    Certified credits can be sold on carbon markets.
    """
    verifier = CreditVerifier(db)

    credit = await verifier.certify(
        credit_id=credit_id,
        certificate_url=certification_data.certificate_url,
        certificate_id=certification_data.certificate_id,
        expiry_years=certification_data.expiry_years,
    )

    if not credit:
        raise NotFoundException("CarbonCredit", str(credit_id))

    return CarbonCreditResponse.model_validate(credit)


@router.post("/credits/{credit_id}/sell", response_model=CreditSaleResponse)
async def sell_credit(
    credit_id: UUID,
    sale_data: CreditSaleRequest,
    db: AsyncSession = Depends(get_db),
) -> CreditSaleResponse:
    """
    Sell a carbon credit.

    Records the sale transaction and marks the credit as sold.
    """
    monetizer = CreditMonetizer(db)

    result = await monetizer.sell(
        credit_id=credit_id,
        price_per_ton=sale_data.price_per_ton,
        buyer_name=sale_data.buyer_name,
        buyer_id=sale_data.buyer_id,
        payment_method=sale_data.payment_method,
    )

    if not result:
        raise NotFoundException("CarbonCredit", str(credit_id))

    return CreditSaleResponse(
        credit_id=credit_id,
        transaction_id=result["transaction_id"],
        amount_inr=result["amount_inr"],
        status=result["status"],
    )


@router.get("/transactions", response_model=list[TransactionResponse])
async def list_transactions(
    credit_id: Optional[UUID] = None,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[TransactionResponse]:
    """List transactions, optionally filtered by credit."""
    repo = CarbonCreditRepository(db)

    transactions = await repo.list_transactions(
        credit_id=credit_id,
        limit=limit,
    )

    return [TransactionResponse.model_validate(t) for t in transactions]


@router.get("/stats", response_model=CarbonCreditStatsResponse)
async def get_carbon_stats(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
) -> CarbonCreditStatsResponse:
    """Get carbon credit statistics for the specified period."""
    repo = CarbonCreditRepository(db)

    stats = await repo.get_stats(days=days)

    return CarbonCreditStatsResponse(**stats)


@router.get("/plants/{plant_id}/credits")
async def get_plant_credits(
    plant_id: UUID,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get carbon credits for a specific plant."""
    repo = CarbonCreditRepository(db)

    credits = await repo.get_by_plant(plant_id, status=status)

    return {
        "plant_id": plant_id,
        "total_credits": len(credits),
        "total_tons": sum(c.credit_amount for c in credits),
        "estimated_value": sum(c.total_value_inr or 0 for c in credits),
        "credits": [CarbonCreditResponse.model_validate(c) for c in credits],
    }


@router.get("/routes/{route_id}/credit")
async def get_route_credit(
    route_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get carbon credit generated from a specific route."""
    repo = CarbonCreditRepository(db)

    credit = await repo.get_by_route(route_id)

    if not credit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No carbon credit found for route {route_id}",
        )

    return CarbonCreditResponse.model_validate(credit)
