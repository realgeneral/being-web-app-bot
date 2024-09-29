from pydantic import BaseModel

class BotTextBase(BaseModel):
    message_key: str
    language_code: str
    text_content: str

class BotTextCreate(BotTextBase):
    pass

class BotTextUpdate(BaseModel):
    text_content: Optional[str]

class BotTextInDB(BotTextBase):
    id: int

    class Config:
        orm_mode = True
