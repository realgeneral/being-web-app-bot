from pydantic import BaseModel, validator
from typing import Optional
from decimal import Decimal
from datetime import datetime

class WalletTransactionBase(BaseModel):
    user_id: int
    wallet_address: str
    amount: Decimal
    transaction_type: str  # 'deposit' или 'withdrawal'

    @validator('transaction_type')
    def validate_transaction_type(cls, v):
        if v not in ('deposit', 'withdrawal'):
            raise ValueError("transaction_type must be 'deposit' or 'withdrawal'")
        return v

class WalletTransactionCreate(WalletTransactionBase):
    pass

class WalletTransactionUpdate(BaseModel):
    status: Optional[str]  # 'pending', 'completed', 'failed'
    transaction_hash: Optional[str]

    @validator('status')
    def validate_status(cls, v):
        if v not in ('pending', 'completed', 'failed'):
            raise ValueError("status must be 'pending', 'completed', or 'failed'")
        return v

class WalletTransactionOut(BaseModel):
    id: int
    user_id: int
    wallet_address: str
    transaction_hash: Optional[str]
    amount: Decimal
    transaction_type: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
