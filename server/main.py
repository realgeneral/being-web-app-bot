from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from aiogram import Bot, Dispatcher
from urllib.parse import unquote, parse_qsl
import logging
import hashlib
import hmac
import os
import json

# Initialize FastAPI
app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",
    "https://5757-89-248-191-104.ngrok-free.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = '7694592328:AAHKHS6air9NKLVhtaiS6u8vztnWxO0AZxM'  # Store securely
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)

# Model for receiving Telegram auth data
class TelegramAuthData(BaseModel):
    initData: str

# Helper function to verify Telegram init data
def verify_telegram_init_data(init_data: str) -> bool:
    try:
        # Decode URL-encoded init data
        init_data_decoded = unquote(init_data)
        # Parse the decoded data into a dictionary
        parsed_data = dict(parse_qsl(init_data_decoded))
        received_hash = parsed_data.pop('hash', '')

        # Create data check string sorted alphabetically by key
        data_check_string = '\n'.join(sorted(f"{k}={v}" for k, v in parsed_data.items()))

        # Generate the secret key using the bot token and "WebAppData"
        secret_key = hmac.new("WebAppData".encode(), BOT_TOKEN.encode(), hashlib.sha256).digest()

        # Calculate the HMAC for the data check string
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        # Log for debugging
        logger.info(f"Parsed data: {parsed_data}")
        logger.info(f"Data check string: {data_check_string}")
        logger.info(f"Calculated HMAC string: {calculated_hash}")
        logger.info(f"Received hash: {received_hash}")

        # Return comparison result
        if calculated_hash != received_hash:
            logger.error(f"HMAC Mismatch: {calculated_hash} (calculated) vs {received_hash} (received)")
            return False

        return True
    except Exception as e:
        logger.error(f"Error during Telegram data verification: {str(e)}")
        return False

# Endpoint for handling Telegram webhook requests
@app.post("/api/auth/telegram")
async def telegram_auth(data: TelegramAuthData):
    try:
        # Verify the Telegram init data
        is_valid = verify_telegram_init_data(data.initData)
        if not is_valid:
            logger.error("Invalid Telegram data")
            raise HTTPException(status_code=400, detail="Invalid Telegram data")

        # Decode initData for user details
        decoded_data = dict(parse_qsl(unquote(data.initData)))
        user_data = json.loads(decoded_data.get('user', '{}'))

        # Log received and decoded user data, showing Cyrillic correctly
        logger.info(f"Received initData: {data.initData}")
        logger.info(f"Decoded user data: {user_data}")

        if not user_data:
            logger.error("Failed to decode Telegram user data")
            raise HTTPException(status_code=400, detail="Invalid Telegram data")

        return {"status": "success", "user": user_data}

    except Exception as e:
        logger.error(f"Error during Telegram authentication: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to authenticate Telegram data")

# Example endpoint to verify the server is running
@app.get("/api/hello")
async def say_hello():
    return {"message": "Hello from FastAPI"}

# Endpoint for logging messages from the frontend
@app.post("/api/logs")
async def log_from_frontend(data: dict):
    logger.info(f"Frontend log: {data}")
    return {"status": "success"}
