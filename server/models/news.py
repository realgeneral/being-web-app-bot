# models.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from .base import Base
import datetime

class News(Base):
    __tablename__ = 'news'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)  # Подробное содержание новости
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
