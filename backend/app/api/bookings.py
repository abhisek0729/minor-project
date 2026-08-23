from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.base import Booking
from app.schemas.booking import (
    CreateBookingRequest,
    UpdateBookingRequest,
    BookingResponse,
    BookingListResponse,
)
from datetime import datetime

router = APIRouter(prefix="/bookings", tags=["bookings"])

# Helper to get current user ID (simplified - normally from JWT token)
def get_current_user_id() -> int:
    # In a real app, extract from JWT token
    # For now, return a default user ID
    return 1

@router.post("", response_model=BookingResponse)
async def create_booking(
    req: CreateBookingRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Create a new booking for accommodation, restaurant, guide, or travel."""
    try:
        booking = Booking(
            user_id=user_id,
            entity_type=req.entity_type,
            entity_id=req.entity_id,
            entity_name=req.entity_name,
            location=req.location,
            check_in_date=req.check_in_date,
            check_out_date=req.check_out_date,
            total_cost=req.total_cost,
            booking_notes=req.booking_notes,
            booking_status="pending",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        return booking
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=BookingListResponse)
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
    status: str | None = None,
    entity_type: str | None = None,
):
    """List all bookings for the current user, optionally filtered by status or entity type."""
    query = select(Booking).where(Booking.user_id == user_id)
    
    if status:
        query = query.where(Booking.booking_status == status)
    if entity_type:
        query = query.where(Booking.entity_type == entity_type)
    
    query = query.order_by(desc(Booking.created_at))
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    return BookingListResponse(bookings=bookings, total=len(bookings))

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Get a specific booking by ID."""
    query = select(Booking).where(
        (Booking.id == booking_id) & (Booking.user_id == user_id)
    )
    result = await db.execute(query)
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    req: UpdateBookingRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Update a booking."""
    query = select(Booking).where(
        (Booking.id == booking_id) & (Booking.user_id == user_id)
    )
    result = await db.execute(query)
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Update fields if provided
    if req.booking_status:
        booking.booking_status = req.booking_status
    if req.check_in_date:
        booking.check_in_date = req.check_in_date
    if req.check_out_date:
        booking.check_out_date = req.check_out_date
    if req.booking_notes is not None:
        booking.booking_notes = req.booking_notes
    
    booking.updated_at = datetime.utcnow()
    
    try:
        await db.commit()
        await db.refresh(booking)
        return booking
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{booking_id}")
async def delete_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Delete (cancel) a booking."""
    query = select(Booking).where(
        (Booking.id == booking_id) & (Booking.user_id == user_id)
    )
    result = await db.execute(query)
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.booking_status = "cancelled"
    booking.updated_at = datetime.utcnow()
    
    try:
        await db.commit()
        return {"status": "cancelled", "booking_id": booking_id}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
