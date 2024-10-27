import pandas as pd
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from sqlalchemy import func
from server.models import User, Task, TaskStatus
from server.database import get_session

import pandas as pd
import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from sqlalchemy import func
from server.models import User, Task, TaskStatus
from server.database import get_session

async def export_tables_to_excel():
    print("Текущая рабочая директория:", os.getcwd())
    async for session in get_session():
        print("Сессия базы данных открыта")
        # Удаляем блок try...except для отладки
        # Экспорт таблицы пользователей
        print("Экспорт таблицы пользователей...")
        users_result = await session.execute(select(User))
        users = users_result.scalars().all()
        print(f"Количество пользователей: {len(users)}")
        users_data = [user.__dict__ for user in users]
        users_df = pd.DataFrame(users_data)
        users_df.to_excel('users.xlsx', index=False)
        print("Файл users.xlsx сохранён")

        # Экспорт таблицы задач
        print("Экспорт таблицы задач...")
        tasks_result = await session.execute(select(Task))
        tasks = tasks_result.scalars().all()
        print(f"Количество задач: {len(tasks)}")
        tasks_data = [task.__dict__ for task in tasks]
        tasks_df = pd.DataFrame(tasks_data)
        tasks_df.to_excel('tasks.xlsx', index=False)
        print("Файл tasks.xlsx сохранён")

        # Экспорт таблицы статусов задач
        print("Экспорт таблицы статусов задач...")
        statuses_result = await session.execute(select(TaskStatus))
        statuses = statuses_result.scalars().all()
        print(f"Количество статусов: {len(statuses)}")
        statuses_data = [status.__dict__ for status in statuses]
        statuses_df = pd.DataFrame(statuses_data)
        statuses_df.to_excel('task_statuses.xlsx', index=False)
        print("Файл task_statuses.xlsx сохранён")

        print("Экспорт таблиц завершен.")


async def get_user_statistics():
    async for session in get_session():
        # Общее количество пользователей
        total_users = await session.execute(func.count(User.id))
        total_users_count = total_users.scalar()

        # Количество пользователей, присоединившихся за последние сутки
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        recent_users = await session.execute(
            select(func.count(User.id)).where(User.created_at >= one_day_ago)
        )
        recent_users_count = recent_users.scalar()

    return {
        'total_users': total_users_count,
        'recent_users': recent_users_count
    }

async def get_task_statistics():
    async for session in get_session():
        # Общее количество задач
        total_tasks = await session.execute(func.count(Task.id))
        total_tasks_count = total_tasks.scalar()

        # Количество задач по статусам
        status_counts = await session.execute(
            select(TaskStatus.status, func.count(Task.id))
            .join(Task, Task.status_id == TaskStatus.id)
            .group_by(TaskStatus.status)
        )
        status_counts_result = status_counts.all()

    task_statuses = {status: count for status, count in status_counts_result}

    return {
        'total_tasks': total_tasks_count,
        'task_statuses': task_statuses
    }