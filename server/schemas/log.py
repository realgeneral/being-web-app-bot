from pydantic import BaseModel
from typing import Optional

class LogBase(BaseModel):
    user_id: Optional[int]
    action: str
    details: Optional[str] = None

class LogCreate(LogBase):
    pass

class LogInDB(LogBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        orm_mode = True