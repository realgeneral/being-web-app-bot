from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, text, BigInteger
from sqlalchemy.orm import relationship

from .base import Base

class Referral(Base):
    __tablename__ = 'referrals'

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    referred_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    referre_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text('CURRENT_TIMESTAMP')
    )

    referrer = relationship("User", back_populates="referrals_record", foreign_keys=[referrer_id])
    referred = relationship("User", foreign_keys=[referred_id])
