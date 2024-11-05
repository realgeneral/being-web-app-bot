from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import logging

from server.database import get_session
from server.models import WalletTransaction, User
from server.schemas.wallet_transaction import WalletTransactionCreate, WalletTransactionUpdate, WalletTransactionOut
from server.schemas.user import UserResponse
from server.dependencies import get_current_user  # Функция для получения текущего пользователя

router = APIRouter()

# Настройка логирования
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Список ID администраторов
ADMIN_IDS = [7154683616, 1801021065]  # Замените на реальные ID администраторов

# Создание новой транзакции
@router.post("/transactions/", response_model=WalletTransactionOut, status_code=201)
async def create_wallet_transaction(
    transaction: WalletTransactionCreate,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        # Проверяем, что пользователь создает транзакцию для себя
        if current_user.id != transaction.user_id:
            raise HTTPException(status_code=403, detail="Вы не можете создать транзакцию для другого пользователя")

        # Создаем новую транзакцию
        new_transaction = WalletTransaction(
            user_id=transaction.user_id,
            wallet_address=transaction.wallet_address,
            amount=transaction.amount,
            transaction_type=transaction.transaction_type,
            status='pending'
        )
        session.add(new_transaction)
        await session.commit()
        await session.refresh(new_transaction)
        logger.info(f"Транзакция {new_transaction.id} создана пользователем {current_user.id}")
        return new_transaction
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Ошибка при создании транзакции: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

# Обновление статуса транзакции (только для администраторов)
@router.put("/transactions/{transaction_id}/", response_model=WalletTransactionOut)
async def update_wallet_transaction(
    transaction_id: int,
    transaction_update: WalletTransactionUpdate,
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        # Получаем транзакцию из базы данных
        result = await session.execute(select(WalletTransaction).where(WalletTransaction.id == transaction_id))
        transaction = result.scalar_one_or_none()
        if not transaction:
            raise HTTPException(status_code=404, detail="Транзакция не найдена")

        # Обновляем поля транзакции
        for var, value in transaction_update.dict(exclude_unset=True).items():
            setattr(transaction, var, value)

        # Если статус обновлен на 'completed', обновляем баланс пользователя
        if transaction_update.status == 'completed':
            # Получаем пользователя
            result = await session.execute(select(User).where(User.id == transaction.user_id))
            user = result.scalar_one_or_none()
            if user:
                points = 0
                if (transaction.amount == 3):
                    points = 1500
                elif (transaction.amount == 10):
                    points = 5000
                elif (transaction.amount == 50):
                    points = 25000
                user.points += int(points)
                session.add(user)

        session.add(transaction)
        await session.commit()
        await session.refresh(transaction)
        logger.info(f"Транзакция {transaction_id} обновлена пользователем {current_user.id}")
        return transaction
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Ошибка при обновлении транзакции {transaction_id}: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

# Получение всех транзакций текущего пользователя
@router.get("/transactions/", response_model=List[WalletTransactionOut])
async def get_wallet_transactions(
    current_user: UserResponse = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        result = await session.execute(
            select(WalletTransaction).where(WalletTransaction.user_id == current_user.id).order_by(WalletTransaction.created_at.desc())
        )
        transactions = result.scalars().all()
        return transactions
    except Exception as e:
        logger.error(f"Ошибка при получении транзакций пользователя {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")
