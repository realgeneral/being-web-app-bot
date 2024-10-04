# server/schemas/task.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class TaskBase(BaseModel):
    task_type_id: int
    name: str
    description: Optional[str] = None
    link: str
    total_clicks: int
    reward_points: int
    is_premium_only: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    total_clicks: Optional[int] = None
    reward_points: Optional[int] = None
    is_premium_only: Optional[bool] = None

class TaskInDBBase(TaskBase):
    id: int
    user_id: int
    completed_clicks: int
    is_active: bool
    start_date: datetime
    end_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Task(TaskInDBBase):
    pass
