# schemas.py
from pydantic import BaseModel
from typing import Optional
import datetime

class NewsBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None

class NewsCreate(NewsBase):
    pass

class NewsUpdate(NewsBase):
    pass

class NewsOut(NewsBase):
    id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True
