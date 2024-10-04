# app/crud/referral.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from ..models.referral import Referral
from ..schemas.referral import ReferralCreate

async def get_referral(db: AsyncSession, referral_id: int):
    try:
        result = await db.execute(select(Referral).filter(Referral.id == referral_id))
        return result.scalars().first()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_referral(db: AsyncSession, referral: ReferralCreate):
    new_referral = Referral(**referral.dict())
    try:
        db.add(new_referral)
        await db.commit()
        await db.refresh(new_referral)
        return new_referral
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def delete_referral(db: AsyncSession, referral_id: int):
    referral = await get_referral(db, referral_id)
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    try:
        await db.delete(referral)
        await db