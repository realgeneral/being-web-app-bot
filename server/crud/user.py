import logging
import random
import string
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from server.models import User, Referral
from server.schemas.user import UserCreate, UserUpdate
from server.schemas.refferals import ReferralResponse

logger = logging.getLogger(__name__)


async def get_user_by_telegram_id(db: AsyncSession, telegram_id: int):
    try:
        result = await db.execute(select(User).filter(User.telegram_id == telegram_id))
        return result.scalars().first()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_user(db: AsyncSession, user: UserCreate):
    new_user = User(**user.dict())
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except Exception as e:
        await db.rollback()
        logging.error(f"Database error {e}")

        raise HTTPException(status_code=500, detail=str(e))

async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate):
    user = await get_user_by_telegram_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(user, key, value)
    
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def delete_user(db: AsyncSession, user_id: int):
    user = await get_user_by_telegram_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        await db.delete(user)
        await db.commit()
        return {"message": "User deleted successfully"}
    except SQLAlchemyError as e:
        await db.rollback

async def generate_unique_referral_code(db: AsyncSession):
    while True:
        try:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            result = await db.execute(select(User).where(User.referral_code == code))
            existing_user = result.scalar_one_or_none()
            if not existing_user:
                return code
        except SQLAlchemyError as e:
            logger.error(f"Database error during referral code generation: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")
        except Exception as e:
            logger.error(f"Unexpected error during referral code generation: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")


async def get_user_by_referral_code(db: AsyncSession, referral_code: str):
    try:
        result = await db.execute(select(User).where(User.referral_code == referral_code))
        return result.scalar_one_or_none()
    except SQLAlchemyError as e:
        logger.error(f"Database error during get_user_by_referral_code: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

async def add_referral_record(db: AsyncSession, referrer_id: int, referred_id: int):
    try:
        referral_record = Referral(
            referrer_id=referrer_id,
            referred_id=referred_id
        )
        db.add(referral_record)
        await db.commit()
    except SQLAlchemyError as e:
        logger.error(f"Database error during add_referral_record: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def increment_user_points(db: AsyncSession, user_id: int, points: int):
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.points += points
            db.add(user)
            await db.commit()
            await db.refresh(user)
            # return user
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except SQLAlchemyError as e:
        logger.error(f"Database error during increment_user_points: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

async def get_users_referrals(db: AsyncSession, user_id: int) -> List[ReferralResponse]:
    try:
        result = await db.execute(
            select(User.username)
            .join(Referral, Referral.referred_id == User.id)
            .where(Referral.referrer_id == user_id)
        )
        referrals = result.all()
        return [ReferralResponse(username=ref.username) for ref in referrals]
    except SQLAlchemyError as e:
        logger.error(f"Database error during get_user_referrals: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")