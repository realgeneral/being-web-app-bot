# app/crud/language.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from ..models.language import Language
from ..schemas.language import LanguageCreate, LanguageUpdate

async def get_language(db: AsyncSession, code: str):
    try:
        result = await db.execute(select(Language).filter(Language.code == code))
        return result.scalars().first()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_language(db: AsyncSession, language: LanguageCreate):
    new_language = Language(**language.dict())
    try:
        db.add(new_language)
        await db.commit()
        await db.refresh(new_language)
        return new_language
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def update_language(db: AsyncSession, code: str, language_update: LanguageUpdate):
    language = await get_language(db, code)
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")

    for key, value in language_update.dict(exclude_unset=True).items():
        setattr(language, key, value)

    try:
        await db.commit()
        await db.refresh(language)
        return language
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def delete_language(db: AsyncSession, code: str):
    language = await get_language(db, code)
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")

    try:
        await db.delete(language)
        await db.commit()
        return {"message": "Language deleted successfully"}
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
