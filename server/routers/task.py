# server/routers/task.py
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from server.schemas.task import TaskCreate, TaskInDBBase, ClaimTaskRequest, FinishTaskRequest
from server.crud.task import create_task, get_active_tasks_by_user_id, get_tasks_with_type, claim_task_in_db, finish_task_in_db, get_archived_tasks_by_user_id
from server.database import get_session
from server.schemas.user import UserResponse
from server.dependencies import get_current_user

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/create", response_model=TaskInDBBase)
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

@router.get("/get_active_tasks", response_model=List[TaskInDBBase])
async def get_user_tasks(
    task_type_id: Optional[int] = Query(None, description="Фильтр по типу задачи"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        # Получаем активные задачи пользователя
        tasks = await get_active_tasks_by_user_id(db, current_user.telegram_id)

        # Если указан task_type_id, то фильтруем задачи по типу
        if task_type_id is not None:
            tasks = [task for task in tasks if task.task_type_id == task_type_id]

        logger.info(f"Fetched tasks for user {current_user.username}")
        return tasks
    except Exception as e:
        logger.error(f"Error fetching tasks for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")

@router.get("/get_archived_tasks", response_model=List[TaskInDBBase])
async def get_archived_tasks(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        # Получаем архивные задачи пользователя
        tasks = await get_archived_tasks_by_user_id(db, current_user.telegram_id)

        logger.info(f"Fetched archived tasks for user {current_user.username}")
        return tasks
    except Exception as e:
        logger.error(f"Error fetching archived tasks for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch archived tasks")


@router.get("/get_tasks_with_type", response_model=List[TaskInDBBase])
async def get_user_tasks(
    task_type_id: Optional[int] = Query(None, description="Фильтр по типу задачи"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        logger.info(f"1")
        tasks = await get_tasks_with_type(db, current_user.telegram_id, task_type_id)
        logger.info(f"Fetched tasks for user {current_user} with task_type_id={task_type_id}: {tasks}")
        return tasks
    except Exception as e:
        logger.error(f"Error fetching tasks for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")


@router.post("/claim_task")
async def claim_task(
    task: ClaimTaskRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        claimed_task = await claim_task_in_db(db, task.task_id, current_user.telegram_id)
        return {"status": "success", "task": claimed_task}
    except ValueError as e:
        logging.error(f"Error claiming task: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error claiming task: {e}")
        raise HTTPException(status_code=500, detail="Failed to claim task")


@router.post("/finish_task")
async def finish_task(
    request: FinishTaskRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        task = await finish_task_in_db(db, request.task_id, current_user.telegram_id)
        return {"status": "success", "task": task}
    except ValueError as e:
        logging.error(f"Error finishing task: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error finishing task: {e}")
        raise HTTPException(status_code=500, detail="Failed to finish task")