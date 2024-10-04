import asyncio
from server.database import engine, async_session  
from server.models import Base
from server.models import User, Language, TaskType, Task, Referral, WalletTransaction, Log, BotText   # Import all your models

async def recreate_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with async_session() as session:
        async with session.begin():
            languages = [
                Language(code='en', name='English'),
                Language(code='ru', name='Russian'),
            ]

            session.add_all(languages)
            initial_task_types = [
                TaskType(id=1, name='Bot'),
                TaskType(id=2, name='Subscribe to Channel'),
            ]
            session.add_all(initial_task_types)
        await engine.dispose()
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(recreate_database())
