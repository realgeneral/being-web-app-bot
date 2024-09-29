# app/routers/telegram.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from urllib.parse import unquote, parse_qsl
import hashlib
import hmac
import json
import logging

router = APIRouter()

BOT_TOKEN = '7694592328:AAHKHS6air9NKLVhtaiS6u8vztnWxO0AZxM'
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

@router.post("/telegram")
async def telegram_auth(data: TelegramAuthData):
    try:
        is_valid = verify_telegram_init_data(data.initData)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid Telegram data")
        
        decoded_data = dict(parse_qsl(unquote(data.initData)))
        user_data = json.loads(decoded_data.get('user', '{}'))

        if not user_data:
            raise HTTPException(status_code=400, detail="Failed to decode Telegram user data")

        return {"status": "success", "user": user_data}

    except Exception as e:
        logger.error(f"Error during Telegram authentication: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to authenticate Telegram data")
