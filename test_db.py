import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = "mysql+aiomysql://klyshkik_being:tbNj!za6t@klyshkik.beget.tech:3306/klyshkik_being"

async def test_connection():
    engine = create_async_engine(DATABASE_URL, echo=True)
    try:
        async with engine.connect() as conn:
            result = await conn.execute("SELECT 1")
            print("Connection successful:", result.scalar())
    except Exception as e:
        print("Connection failed:", e)
    finally:
        await engine.dispose()

asyncio.run(test_connection())