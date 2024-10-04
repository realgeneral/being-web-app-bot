# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers import logs, telegram, task

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",
    "https://19a8-89-248-191-104.ngrok-free.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить все источники (только для отладки)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # Разрешить все заголовки
)

# Подключение модульных роутеров
app.include_router(logs, prefix="/api/logs", tags=["logs"])
app.include_router(telegram, prefix="/api/auth", tags=["telegram"])
app.include_router(task, prefix="/api/task", tags=["task"])

for route in app.routes:
    methods = ','.join(route.methods)
    print(f"{route.path} [{methods}] -> {route.name}")

# Example endpoint to verify the server is running
@app.get("/api/hello")
async def say_hello():
    return {"message": "Hello from FastAPI"}
