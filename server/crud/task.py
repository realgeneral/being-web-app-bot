import logging

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists
from server.models import Task, User, TaskClick
from server.schemas.task import TaskCreate
from fastapi import HTTPException

async def create_task(db: AsyncSession, user_id: int, task_data: TaskCreate):
    # Получаем пользователя
    result = await db.execute(select(User).where(User.telegram_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Вычисляем общую стоимость
    total_cost = task_data.total_clicks * task_data.reward_per_click

    # Проверяем, хватает ли у пользователя баллов
    if user.points < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient points to create this task.")

    # Списываем баллы со счета пользователя
    user.points -= total_cost
    db.add(user)

    # Создаем новое задание
    new_task = Task(
        user_id=user_id,
        task_type_id=task_data.task_type_id,
        name=task_data.name,
        link=task_data.link,
        status_id=1,
        total_clicks=task_data.total_clicks,
        reward_per_click=task_data.reward_per_click,
        completed_clicks=0,
        reserved_points=total_cost
    )

    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

async def get_archived_tasks_by_user_id(db: AsyncSession, user_id: int):
    try:
        # Извлекаем задачи, которые завершены (status_id = 3) или в архиве (status_id = 2)
        result = await db.execute(
            select(Task).where(Task.user_id == user_id, Task.status_id.in_([2, 3]))
        )
        tasks = result.scalars().all()
        return tasks
    except Exception as e:
        logging.error(f"Error fetching archived tasks for user {user_id}: {e}")
        raise e


async def get_active_tasks_by_user_id(db: AsyncSession, user_id: int):
    try:
        # Извлекаем задачи с активным статусом (status_id = 1)
        result = await db.execute(
            select(Task).where(Task.user_id == user_id, Task.status_id == 1)
        )
        tasks = result.scalars().all()
        return tasks
    except Exception as e:
        logging.error(f"Error fetching active tasks for user {user_id}: {e}")
        raise e

async def get_tasks_with_type(db: AsyncSession, current_user_id: int, task_type_id: Optional[int] = None):
    # Формируем подзапрос для проверки, кликал ли пользователь по задаче
    subquery = (
        select(TaskClick.task_id)
        .where(TaskClick.user_id == current_user_id)
        .where(TaskClick.task_id == Task.id)
    )

    # Формируем основной запрос для задач, которые не принадлежат текущему пользователю
    query = (
        select(Task)
        .where(Task.user_id != current_user_id)
        .where(~exists(subquery))  # Исключаем задачи, по которым пользователь уже кликнул
    )
    
    # Если указан task_type_id, добавляем фильтр по типу задачи
    if task_type_id is not None:
        query = query.where(Task.task_type_id == task_type_id)
    
    query = query.limit(10)  # Ограничиваем результат 10 задачами

    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return tasks

async def archive_task(db: AsyncSession, task_id: int, user_id: int):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    user = await db.execute(select(User).where(User.telegram_id == user_id))
    user = user.scalar_one_or_none()

    # Вернуть баллы за невыполненные клики
    unused_points = task.reserved_points - task.completed_clicks * task.reward_per_click
    user.points += unused_points
    db.add(user)

    await db.commit()
    return task

async def claim_task_in_db(db: AsyncSession, task_id: int, telegram_id: int):
    try:
        result_task = await db.execute(select(Task).where(Task.id == int(task_id)))
        task = result_task.scalar_one_or_none()
        
        result_user = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result_user.scalar_one_or_none()

        if not user:
            raise ValueError(f"User {telegram_id} not found")
        if not task:
            raise ValueError(f"Task with id {task_id} not found")

        logging.info(f"Claiming task: {task.id}, total clicks: {task.total_clicks}, completed clicks: {task.completed_clicks}")

        # Проверка, захватывал ли уже пользователь эту задачу
        task_click_exists = await db.execute(select(TaskClick).where(TaskClick.task_id == task_id, TaskClick.user_id == telegram_id))
        if task_click_exists.scalar_one_or_none():
            raise ValueError(f"Task {task_id} already claimed by user {telegram_id}")

        # Добавление новой записи в таблицу TaskClick
        new_click = TaskClick(task_id=task_id, user_id=telegram_id)
        db.add(new_click)

        # Обновление количества выполненных кликов
        task.completed_clicks += 1
        logging.info(f"Updated completed clicks for task {task_id}: {task.completed_clicks}/{task.total_clicks}")

         # Вернуть баллы за невыполненные клики
        added_points =  task.reward_per_click * 0.7
        user.points += added_points

        # Сохранение изменений
        await db.commit()
        await db.refresh(task)
        await db.refresh(user)


        logging.info(f"Task {task_id} successfully claimed by user {telegram_id}")
        return task

    except Exception as e:
        logging.error(f"Error claiming task {task_id} for user {telegram_id}: {e}")
        await db.rollback()
        raise


async def finish_task_in_db(db: AsyncSession, task_id: int, telegram_id: int):
    try:
        # Получаем задачу
        result = await db.execute(
            select(Task).where(Task.id == task_id, Task.user_id == telegram_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            raise ValueError(f"Task with id {task_id} not found for user {telegram_id}")

        if task.status_id == 3:
            raise ValueError(f"Task {task_id} is already completed")

        # Вычисляем и возвращаем неиспользованные поинты
        unused_points = task.reserved_points - (task.completed_clicks * task.reward_per_click)
        
        # Обновляем баланс пользователя, добавляя неиспользованные поинты
        result_user = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result_user.scalar_one_or_none()
        
        if user:
            user.points += unused_points
            db.add(user)
        
        # Обновляем статус задачи на "завершенную" (например, status_id = 3)
        task.status_id = 3
        db.add(task)
        
        # Сохраняем изменения
        await db.commit()
        await db.refresh(task)
        await db.refresh(user)

        return task

    except Exception as e:
        logging.error(f"Error finishing task {task_id} for user {telegram_id}: {e}")
        await db.rollback()
        raise