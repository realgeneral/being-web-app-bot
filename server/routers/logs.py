from fastapi import APIRouter
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/")
async def log_from_frontend(data: dict):
    logger.info(f"Frontend log: {data}")
    return {"status": "success"}
