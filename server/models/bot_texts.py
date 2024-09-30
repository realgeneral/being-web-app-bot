import sqlalchemy

from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, text, BigInteger
from sqlalchemy.orm import relationship

from .base import Base

class BotText(Base):
    __tablename__ = 'bot_texts'

    id = Column(BigInteger, primary_key=True, index=True)
    message_key = Column(String(100), nullable=False)
    language_code = Column(String(5), ForeignKey('languages.code'), nullable=False)
    text_content = Column(Text, nullable=False)

    language = relationship("Language", back_populates="bot_texts")

    __table_args__ = (
        # Уникальность комбинации message_key и language_code
        sqlalchemy.UniqueConstraint('message_key', 'language_code', name='uix_message_language'),
    )
