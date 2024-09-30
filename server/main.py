# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers import logs, telegram

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",
    "https://559d-89-248-191-104.ngrok-free.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение модульных роутов
app.include_router(logs, prefix="/api/logs", tags=["logs"])
app.include_router(telegram, prefix="/api/auth", tags=["telegram"])

# Example endpoint to verify the server is running
@app.get("/api/hello")
async def say_hello():
    return {"message": "Hello from FastAPI"}