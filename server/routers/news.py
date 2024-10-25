# main.py
from fastapi import APIRouter, FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from server.database import get_session
from server.models import News
from server.schemas.news import NewsCreate, NewsUpdate, NewsOut
from server.schemas.user import UserResponse
from server.dependencies import get_current_user  # Импортируем вашу функцию

router = APIRouter()

# Список ID администраторов
ADMIN_IDS = [7154683616]  # Замените на реальные ID администраторов

# Получение списка новостей
@router.get("/news/", response_model=List[NewsOut])
async def get_news(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(News).order_by(News.created_at.desc()))
    news_items = result.scalars().all()
    return news_items

# Получение конкретной новости
@router.get("/news/{news_id}", response_model=NewsOut)
async def get_news_item(news_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(News).where(News.id == news_id))
    news_item = result.scalar_one_or_none()
    if not news_item:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    return news_item

# Создание новой новости (только для администраторов)
@router.post("/news/", response_model=NewsOut, status_code=201)
async def create_news(
    news: NewsCreate,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.telegram_id not in ADMIN_IDS:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    new_news = News(**news.dict())
    session.add(new_news)
    await session.commit()
    await session.refresh(new_news)
    return new_news

# Обновление новости (только для администраторов)
@router.put("/news/{news_id}", response_model=NewsOut)
async def update_news(
    news_id: int,
    news: NewsUpdate,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.telegram_id not in ADMIN_IDS:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    result = await session.execute(select(News).where(News.id == news_id))
    news_item = result.scalar_one_or_none()
    if not news_item:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    for var, value in news.dict(exclude_unset=True).items():
        setattr(news_item, var, value)
    session.add(news_item)
    await session.commit()
    await session.refresh(news_item)
    return news_item

# Удаление новости (только для администраторов)
@router.delete("/news/{news_id}", status_code=204)
async def delete_news(
    news_id: int,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.telegram_id not in ADMIN_IDS:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    result = await session.execute(select(News).where(News.id == news_id))
    news_item = result.scalar_one_or_none()
    if not news_item:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    await session.delete(news_item)
    await session.commit()
    return
