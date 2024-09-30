from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP, text, BigInteger
from sqlalchemy.orm import relationship

from .base import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False)
    username = Column(String(255))
    first_name = Column(String(255))
    last_name = Column(String(255))
    points = Column(Integer, default=0)
    referral_id = Column(BigInteger, ForeignKey('users.id'))
    referral_code = Column(String(10), unique=True)
    is_premium = Column(Boolean, default=False)
    wallet_address = Column(String(255))
    language_code = Column(String(5), ForeignKey('languages.code'), default='en')
    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text('CURRENT_TIMESTAMP')
    )
    updated_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text('CURRENT_TIMESTAMP'),
        server_onupdate=text('CURRENT_TIMESTAMP')
    )
    referrals = relationship("User", remote_side=[id])
    language = relationship("Language", back_populates="users")
    tasks = relationship("Task", back_populates="user")
    referrals_record = relationship("Referral", back_populates="referrer", foreign_keys="Referral.referrer_id")
    wallet_transactions = relationship("WalletTransaction", back_populates="user")
    logs = relationship("Log", back_populates="user")
