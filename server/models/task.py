from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Date, TIMESTAMP, text, BigInteger
from sqlalchemy.orm import relationship

from .base import Base

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.telegram_id', ondelete="CASCADE"), nullable=False)
    task_type_id = Column(Integer, ForeignKey('task_types.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    link = Column(String(255), nullable=False)
    total_clicks = Column(Integer, nullable=False)
    completed_clicks = Column(Integer, default=0)
    reward_points = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    is_premium_only = Column(Boolean, default=False)
    start_date = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text('CURRENT_TIMESTAMP')
    )
    end_date = Column(Date)
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