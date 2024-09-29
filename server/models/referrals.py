from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship

from .base import Base

class Referral(Base):
    __tablename__ = 'referrals'

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    referred_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    referred_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

    referrer = relationship("User", back_populates="referrals_record", foreign_keys=[referrer_id])
    referred = relationship("User", foreign_keys=[referred_id])
