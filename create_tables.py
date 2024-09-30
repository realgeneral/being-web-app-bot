import asyncio
from server.database import engine
from server.models import Base
from server.models import User, Language, TaskType, Task, Referral, WalletTransaction, Log, BotText   # Import all your models

async def recreate_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(recreate_database())
