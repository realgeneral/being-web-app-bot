import os
import logging

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv


logger = logging.getLogger(__name__)

load_dotenv()  # Загрузка переменных окружения из .env файла

DATABASE_USER = os.getenv("DATABASE_USER", "root")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "root")
DATABASE_HOST = os.getenv("DATABASE_HOST", "192.168.215.132")
DATABASE_PORT = os.getenv("DATABASE_PORT", "3306")
DATABASE_NAME = os.getenv("DATABASE_NAME", "bot")

DATABASE_URL = f"mysql+aiomysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

# Создание асинхронного движка
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Включите, если хотите видеть SQL-запросы в логах
)

# Создание асинхронной сессии
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Функция для получения сессии (используется в зависимостях)
async def get_session() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            logging.error(f"Database error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()
