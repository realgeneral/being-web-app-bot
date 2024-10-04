# server/crud/task.py
import logging

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, SQLAlchemyError
from server.models import Task
from server.schemas.task import TaskCreate, TaskUpdate
from server.models import User
from fastapi import HTTPException

async def create_task(db: AsyncSession, user_id: int, task_data: TaskCreate):
    try:
        # Получаем пользователя
        result = await db.execute(select(User).where(User.telegram_id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError(f"User not found {user_id} - {User.telegram_id}")

        # Вычисляем общую стоимость
        total_cost = 0

        # Проверяем, хватает ли у пользователя баллов
        if user.points < total_cost:                                   
            raise ValueError("Insufficient points to create this task.")
                                          
        # Списываем баллы со счета пользователя
        user.points -= total_cost
        db.add(user)  # Добавляем пользователя в сессию для фиксации изменений

        # Создаем новое задание
        new_task = Task(
            user_id=user_id,
            task_type_id=task_data.task_type_id,
            name=task_data.name,
            description=task_data.description,
            link=task_data.link,
            total_clicks=task_data.total_clicks,
            reward_points=task_data.reward_points,
            is_premium_only=task_data.is_premium_only,
            is_active=True,
        )

        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)
        return new_task
    except SQLAlchemyError as e:
        await db.rollback()
        logging.error(f"Database error {e}")
        raise HTTPException(status_code=500, detail=f"Database error {e}")
        
async def get_tasks_by_user_id(db: AsyncSession, user_id: int, task_type_id: Optional[int] = None):
    query = select(Task).where(Task.user_id == user_id)
    if task_type_id is not None:
        query = query.where(Task.task_type_id == task_type_id)
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks
