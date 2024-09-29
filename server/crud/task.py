# app/crud/task.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate

async def get_task(db: AsyncSession, task_id: int):
    try:
        result = await db.execute(select(Task).filter(Task.id == task_id))
        return result.scalars().first()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_task(db: AsyncSession, task: TaskCreate):
    new_task = Task(**task.dict())
    try:
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)
        return new_task
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def update_task(db: AsyncSession, task_id: int, task_update: TaskUpdate):
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(task, key, value)

    try:
        await db.commit()
        await db.refresh(task)
        return task
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def delete_task(db: AsyncSession, task_id: int):
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        await db.delete(task)
        await db.commit()
        return {"message": "Task deleted successfully"}
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
