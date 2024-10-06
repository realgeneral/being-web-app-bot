from sqlalchemy import Column, Integer, BigInteger, ForeignKey, TIMESTAMP, text
from sqlalchemy.orm import relationship

from .base import Base

class TaskClick(Base):
    __tablename__ = 'task_clicks'

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)  # Задача, по которой кликнули
    user_id = Column(BigInteger, ForeignKey('users.telegram_id', ondelete='CASCADE'), nullable=False)  # Пользователь, кликнувший по задаче
    clicked_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))  # Время клика

    # Отношения с другими таблицами
    task = relationship("Task", back_populates="task_clicks")  # Связь с таблицей Task
    user = relationship("User", back_populates="task_clicks")  # Связь с таблицей User
