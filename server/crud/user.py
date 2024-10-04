import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from server.models import User
from server.schemas.user import UserCreate, UserUpdate

async def get_user_by_telegram_id(db: AsyncSession, telegram_id: int):
    try:
        result = await db.execute(select(User).filter(User.telegram_id == telegram_id))
        return result.scalars().first()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_user(db: AsyncSession, user: UserCreate):
    new_user = User(**user.dict())
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except Exception as e:
        await db.rollback()
        logging.error(f"Database error {e}")

        raise HTTPException(status_code=500, detail=str(e))

async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(user, key, value)
    
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def delete_user(db: AsyncSession, user_id: int):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        await db.delete(user)
        await db.commit()
        return {"message": "User deleted successfully"}
    except SQLAlchemyError as e:
        await db.rollback
