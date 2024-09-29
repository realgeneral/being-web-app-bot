from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from enum import Enum

class WalletTransactionTypeEnum(str, Enum):
    deposit = 'deposit'
    withdrawal = 'withdrawal'

class WalletTransactionStatusEnum(str, Enum):
    pending = 'pending'
    completed = 'completed'
    failed = 'failed'

class WalletTransactionBase(BaseModel):
    user_id: int
    wallet_address: str
    transaction_hash: Optional[str] = None
    amount: Decimal
    transaction_type: WalletTransactionTypeEnum
    status: Optional[WalletTransactionStatusEnum] = WalletTransactionStatusEnum.pending

class WalletTransactionCreate(WalletTransactionBase):
    pass

class WalletTransactionUpdate(BaseModel):
    status: Optional[WalletTransactionStatusEnum]

class WalletTransactionInDB(WalletTransactionBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        orm_mode = True
