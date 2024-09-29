from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Date, TIMESTAMP
from sqlalchemy.orm import relationship

from .base import Base

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    task_type_id = Column(Integer, ForeignKey('task_types.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    link = Column(String(255), nullable=False)
    image_url = Column(String(255))
    category = Column(String(50))
    total_clicks = Column(Integer, nullable=False)
    completed_clicks = Column(Integer, default=0)
    reward_points = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    is_premium_only = Column(Boolean, default=False)
    start_date = Column(Date, server_default="CURRENT_DATE")
    end_date = Column(Date)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP", onupdate="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="tasks")
    task_type = relationship("TaskType", back_populates="tasks")
    completions = relationship("TaskCompletion", back_populates="task")
