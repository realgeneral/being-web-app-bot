import os
import logging

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Настройка логирования
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Загрузка переменных окружения из файла .env
load_dotenv()

# Получение переменных из окружения с указанием значений по умолчанию
DATABASE_USER = os.getenv("DATABASE_USER", "root")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "Ie4kyboC&&GJ")
DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
DATABASE_PORT = os.getenv("DATABASE_PORT", "3306")
DATABASE_NAME = os.getenv("DATABASE_NAME", "bot")

# Формирование URL для подключения к базе данных
DATABASE_URL = f"mysql+aiomysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

# Создание асинхронного движка
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Для вывода SQL-запросов в логах, можно отключить в production
)

# Создание асинхронной сессии
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Функция для получения сессии базы данных
async def get_session() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session  # Возвращаем сессию для работы с ней
        except SQLAlchemyError as e:
            logger.error(f"Database error: {e}")
            await session.rollback()  # Откатываем транзакцию в случае ошибки
            raise
        finally:
            await session.close()  # Закрываем сессию в конце
