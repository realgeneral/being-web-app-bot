# server/schemas/user.py

from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    points: Optional[int] = 0
    referral_id: Optional[int] = None
    referral_code: Optional[str] = None
    is_premium: Optional[bool] = False
    wallet_address: Optional[str] = None
    language_code: Optional[str] = 'en'

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    points: Optional[int]
    referral_id: Optional[int]
    referral_code: Optional[str]
    is_premium: Optional[bool]
    wallet_address: Optional[str]
    language_code: Optional[str]

class UserInDB(UserBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    points: int
    referral_code: Optional[str] = None
    is_premium: bool
    language_code: Optional[str]

    class Config:
        orm_mode = True
