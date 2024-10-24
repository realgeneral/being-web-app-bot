from pydantic import BaseModel
from typing import Optional

class LanguageBase(BaseModel):
    code: str
    name: str

class LanguageCreate(LanguageBase):
    pass

class LanguageUpdate(BaseModel):
    name: Optional[str]

class LanguageInDB(LanguageBase):
    code: str

    class Config:
        orm_mode = True
