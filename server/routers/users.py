# В вашем роутере или контроллере

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from server.dependencies import get_session
from server.models import User, Referral
from server.crud.referral import get_referral
from server.schemas.refferals import ReferralResponse
from typing import List


router = APIRouter()

@router.get("/{user_id}/referrals", response_model=List[ReferralResponse])
async def get_user_referrals(user_id: int,     db: AsyncSession = Depends(get_session)):
    # Получаем пользователя по ID
    user = await get_referral(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Получаем список рефералов
    referrals = await get_referral(db, user_id)
    return referrals
