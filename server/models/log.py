from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, text, BigInteger
from sqlalchemy.orm import relationship
from .base import Base

class Log(Base):
    __tablename__ = 'logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text)
    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text('CURRENT_TIMESTAMP')
    )

    user = relationship("User", back_populates="logs")
