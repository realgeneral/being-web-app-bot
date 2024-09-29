from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TaskBase(BaseModel):
    user_id: int
    task_type_id: int
    name: str
    description: Optional[str] = None
    link: str
    image_url: Optional[str] = None
    category: Optional[str] = None
    total_clicks: int
    completed_clicks: Optional[int] = 0
    reward_points: int
    is_active: Optional[bool] = True
    is_premium_only: Optional[bool] = False
    start_date: Optional[date] = Field(default_factory=date.today)
    end_date: Optional[date] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    link: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    total_clicks: Optional[int]
    completed_clicks: Optional[int]
    reward_points: Optional[int]
    is_active: Optional[bool]
    is_premium_only: Optional[bool]
    start_date: Optional[date]
    end_date: Optional[date]

class TaskInDB(TaskBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True
