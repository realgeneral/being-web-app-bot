from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from urllib.parse import unquote, parse_qsl

import hashlib
import hmac
import json
import logging
import os

from sqlalchemy.ext.asyncio import AsyncSession
from server.database import get_session
from server.crud import get_user_by_telegram_id, create_user
from server.schemas.user import UserCreate, UserResponse

router = APIRouter()


BOT_TOKEN = '7379330461:AAFANy49VXwlHwhmZgt99_emw3YW1VZncIw'
logger = logging.getLogger(__name__)

class TelegramAuthData(BaseModel):
    initData: str


def verify_telegram_init_data(init_data: str) -> bool:
    try:
        init_data_decoded = unquote(init_data)
        parsed_data = dict(parse_qsl(init_data_decoded))
        received_hash = parsed_data.pop('hash', '')
        data_check_string = '\n'.join(sorted(f"{k}={v}" for k, v in parsed_data.items()))
        secret_key = hmac.new("WebAppData".encode(), BOT_TOKEN.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if calculated_hash != received_hash:
            logger.error(f"HMAC Mismatch: {calculated_hash} vs {received_hash}")
            return False

        return True
    except Exception as e:
        logger.error(f"Error during Telegram data verification: {str(e)}")
        return False

@router.post("/telegram", response_model=UserResponse)
async def telegram_auth(
    data: TelegramAuthData,
    db: AsyncSession = Depends(get_session)
):
    try:
        is_valid = verify_telegram_init_data(data.initData)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid Telegram data")
        
        decoded_data = dict(parse_qsl(unquote(data.initData)))
        user_data_json = decoded_data.get('user', '{}')
        user_data = json.loads(user_data_json)
        logger.info(f"Decoded user data: {user_data}")

        if not user_data:
            raise HTTPException(status_code=400, detail="Failed to decode Telegram user data")

        telegram_id = user_data.get('id')
        if not telegram_id:
            raise HTTPException(status_code=400, detail="Telegram ID is missing")

        # Проверяем, существует ли пользователь в базе данных
        existing_user = await get_user_by_telegram_id(db, telegram_id)

        if existing_user:
            return existing_user
            logger.error(f"SUCESS ")
        else:
            # Создаем нового пользователя
            new_user = UserCreate(
                telegram_id=telegram_id,
                username=user_data.get('username'),
                first_name=user_data.get('first_name'),
                last_name=user_data.get('last_name'),
                is_premium=user_data.get('is_premium', False),
                language_code=user_data.get('language_code', 'en'),
                # Добавьте дополнительные поля при необходимости
            )
            created_user = await create_user(db, new_user)
            return created_user
    except Exception as e:
        logger.error(f"Error during Telegram authentication: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to authenticate Telegram data")
