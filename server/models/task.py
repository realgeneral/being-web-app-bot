from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Date, TIMESTAMP, text, BigInteger
from sqlalchemy.orm import relationship

from .base import Base

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.telegram_id', ondelete='CASCADE'), nullable=False)  # Кто создал задачу
    task_type_id = Column(Integer, ForeignKey('task_types.id', ondelete='CASCADE'), nullable=False)  # Тип задачи (бот или канал)
    name = Column(String(255), nullable=False)  # Название задачи
    link = Column(String(255), nullable=False)  # Ссылка на задачу (например, https://t.me/...)
    total_clicks = Column(Integer, nullable=False)  # Общее количество необходимых кликов
    completed_clicks = Column(Integer, default=0)  # Количество выполненных кликов
    reward_per_click = Column(Integer, nullable=False)  # Сколько платит создатель задачи за клик
    status_id = Column(Integer, ForeignKey('task_status.id', ondelete='SET NULL'))  # Статус задачи (может стать NULL при удалении статуса)
    is_premium_only = Column(Boolean, default=False)  # Задача доступна только премиум-пользователям
    reserved_points = Column(Integer, nullable=False)  # Зарезервированные баллы для задачи
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

    user = relationship("User", back_populates="tasks")
    task_type = relationship("TaskType", back_populates="tasks")
    status = relationship("TaskStatus", back_populates="tasks")  # Обратная связь с TaskStatus
    task_clicks = relationship("TaskClick", back_populates="task", cascade="all, delete-orphan")  # Обратная связь с TaskClick
