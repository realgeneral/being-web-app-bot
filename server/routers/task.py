# server/routers/task.py
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from server.schemas.task import TaskCreate, Task
from server.crud.task import create_task, get_tasks_by_user_id
from server.database import get_session
from server.schemas.user import UserResponse
from server.dependencies import get_current_user

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/create", response_model=Task)
async def create_new_task(
    task: TaskCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        new_task = await create_task(db, current_user.telegram_id, task)
        return new_task
    except ValueError as e:
        logging.error(f"ValueError creating task: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        # Пробрасываем HTTPException дальше
        raise e
    except Exception as e:
        logging.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/get_tasks", response_model=List[Task])
async def get_user_tasks(
    task_type_id: Optional[int] = Query(None, description="Фильтр по типу задачи"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        
        logger.info(f"1")
        tasks = await get_tasks_by_user_id(db, current_user.telegram_id, task_type_id)
        logger.info(f"Fetched tasks for user {current_user} with task_type_id={task_type_id}: {tasks}")
        return tasks
    except Exception as e:
        logger.error(f"Error fetching tasks for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")