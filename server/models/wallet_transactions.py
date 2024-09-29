from sqlalchemy import Column, Integer, String, Enum, DECIMAL, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship

from .base import Base

class WalletTransaction(Base):
    __tablename__ = 'wallet_transactions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    wallet_address = Column(String(255), nullable=False)
    transaction_hash = Column(String(255))
    amount = Column(DECIMAL(18, 8), nullable=False)
    transaction_type = Column(Enum('deposit', 'withdrawal'), nullable=False)
    status = Column(Enum('pending', 'completed', 'failed'), default='pending')
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="wallet_transactions")