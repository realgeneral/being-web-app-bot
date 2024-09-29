from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from .base import Base

class Language(Base):
    __tablename__ = 'languages'

    code = Column(String(5), primary_key=True, index=True)
    name = Column(String(50), nullable=False)

    users = relationship("User", back_populates="language")
    bot_texts = relationship("BotText", back_populates="language")
