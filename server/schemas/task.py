from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    task_type_id: int
    name: str
    link: str
    total_clicks: int
    reward_per_click: int
    status_id: int

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    total_clicks: Optional[int] = None
    reward_per_click: Optional[int] = None

class TaskInDBBase(TaskBase):
    id: int
    user_id: int
    completed_clicks: int
    reserved_points: int

    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ClaimTaskRequest(BaseModel):
    task_id: int

class FinishTaskRequest(BaseModel):
    task_id: int