from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from .base import Base

class TaskType(Base):
    __tablename__ = 'task_types'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)

    tasks = relationship("Task", back_populates="task_type")
