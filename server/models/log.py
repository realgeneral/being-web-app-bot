from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from .base import Base

class Log(Base):
    __tablename__ = 'logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="logs")
