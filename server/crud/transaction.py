# app/crud/transaction.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from ..models.transaction import Transaction
from ..schemas.transaction import TransactionCreate, TransactionUpdate

async def get_transaction(db: AsyncSession, transaction_id: int):
    try:
        result = await db.execute(select(Transaction).filter(Transaction.id == transaction_id))
        return result.scalars().first()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_transaction(db: AsyncSession, transaction: TransactionCreate):
    new_transaction = Transaction(**transaction.dict())
    try:
        db.add(new_transaction)
        await db.commit()
        await db.refresh(new_transaction)
        return new_transaction
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def update_transaction(db: AsyncSession, transaction_id: int, transaction_update: TransactionUpdate):
    transaction = await get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for key, value in transaction_update.dict(exclude_unset=True).items():
        setattr(transaction, key, value)

    try:
        await db.commit()
        await db.refresh(transaction)
        return transaction
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def delete_transaction(db: AsyncSession, transaction_id: int):
    transaction = await get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    try:
        await db.delete(transaction)
        await db.commit()
        return {"message": "Transaction deleted successfully"}
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
