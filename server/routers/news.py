from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import logging

from server.database import get_session
from server.models import News
from server.schemas.news import NewsCreate, NewsUpdate, NewsOut
from server.schemas.user import UserResponse
from server.dependencies import get_current_user  # Импортируем вашу функцию

router = APIRouter()

# Настройка логирования
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Список ID администраторов
ADMIN_IDS = [7154683616]  # Замените на реальные ID администраторов

# Получение списка новостей
@router.get("/news/", response_model=List[NewsOut])
async def get_news(session: AsyncSession = Depends(get_session)):
    try:
        result = await session.execute(select(News).order_by(News.created_at.desc()))
        news_items = result.scalars().all()
        return news_items
    except Exception as e:
        logger.error(f"Ошибка при получении списка новостей: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

# Получение конкретной новости
@router.get("/news/{news_id}", response_model=NewsOut)
async def get_news_item(news_id: int, session: AsyncSession = Depends(get_session)):
    try:
        result = await session.execute(select(News).where(News.id == news_id))
        news_item = result.scalar_one_or_none()
        if not news_item:
            logger.warning(f"Новость с ID {news_id} не найдена")
            raise HTTPException(status_code=404, detail="Новость не найдена")
        return news_item
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Ошибка при получении новости {news_id}: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

# Создание новой новости (только для администраторов)
@router.post("/news/", response_model=NewsOut, status_code=201)
async def create_news(
    news: NewsCreate,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        if current_user.telegram_id not in ADMIN_IDS:
            logger.warning(f"Пользователь {current_user.telegram_id} попытался создать новость без прав")
            raise HTTPException(status_code=403, detail="Доступ запрещен")
        new_news = News(**news.dict())
        session.add(new_news)
        await session.commit()
        await session.refresh(new_news)
        logger.info(f"Новость с ID {new_news.id} создана пользователем {current_user.telegram_id}")
        return new_news
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Ошибка при создании новости: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

# Обновление новости (только для администраторов)
@router.put("/news/{news_id}", response_model=NewsOut)
async def update_news(
    news_id: int,
    news: NewsUpdate,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        if current_user.telegram_id not in ADMIN_IDS:
            logger.warning(f"Пользователь {current_user.telegram_id} попытался обновить новость без прав")
            raise HTTPException(status_code=403, detail="Доступ запрещен")
        result = await session.execute(select(News).where(News.id == news_id))
        news_item = result.scalar_one_or_none()
        if not news_item:
            logger.warning(f"Новость с ID {news_id} не найдена для обновления")
            raise HTTPException(status_code=404, detail="Новость не найдена")
        for var, value in news.dict(exclude_unset=True).items():
            setattr(news_item, var, value)
        session.add(news_item)
        await session.commit()
        await session.refresh(news_item)
        logger.info(f"Новость с ID {news_id} обновлена пользователем {current_user.telegram_id}")
        return news_item
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Ошибка при обновлении новости {news_id}: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

# Удаление новости (только для администраторов)
@router.delete("/news/{news_id}", status_code=204)
async def delete_news(
    news_id: int,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        if current_user.telegram_id not in ADMIN_IDS:
            logger.warning(f"Пользователь {current_user.telegram_id} попытался удалить новость без прав")
            raise HTTPException(status_code=403, detail="Доступ запрещен")
        result = await session.execute(select(News).where(News.id == news_id))
        news_item = result.scalar_one_or_none()
        if not news_item:
            logger.warning(f"Новость с ID {news_id} не найдена для удаления")
            raise HTTPException(status_code=404, detail="Новость не найдена")
        await session.delete(news_item)
        await session.commit()
        logger.info(f"Новость с ID {news_id} удалена пользователем {current_user.telegram_id}")
        return
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Ошибка при удалении новости {news_id}: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")
