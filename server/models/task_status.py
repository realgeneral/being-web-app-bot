from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from .base import Base

class TaskStatus(Base):
    __tablename__ = 'task_status'

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), unique=True, nullable=False)  # Статус задачи (например, "active", "completed", "cancelled")
    
    tasks = relationship("Task", back_populates="status")
