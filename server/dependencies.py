# server/dependencies.py

from fastapi import Depends, HTTPException, Request
from server.crud.user import get_user_by_telegram_id
from server.schemas.user import UserResponse
from server.routers.logs import logging
from sqlalchemy.ext.asyncio import AsyncSession
from server.database import get_session

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_session)
) -> UserResponse:
    # Предполагается, что вы передаете telegram_id в заголовке запроса
    telegram_id = request.headers.get('X-Telegram-ID')
    logging.info(f"Received X-Telegram-ID: {telegram_id}")
    if not telegram_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user = await get_user_by_telegram_id(db, int(telegram_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    return UserResponse.from_orm(user)
