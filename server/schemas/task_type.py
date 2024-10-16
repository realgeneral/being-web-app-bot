from pydantic import BaseModel

class TaskTypeBase(BaseModel):
    name: str

class TaskTypeCreate(TaskTypeBase):
    pass

class TaskTypeUpdate(BaseModel):
    name: Optional[str]

class TaskTypeInDB(TaskTypeBase):
    id: int

    class Config:
        from_attributes = True
