# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers import logs, telegram, task
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# CORS settings
origins = [
    "https://localhost:5173",
    "https://nollab.ru:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Подключение модульных роутеров
app.include_router(logs, prefix="/api/logs", tags=["logs"])
app.include_router(telegram, prefix="/api/auth", tags=["telegram"])
app.include_router(task, prefix="/api/task", tags=["task"])
app.mount("/", StaticFiles(directory="static", html=True), name="static")

for route in app.routes:
    methods = ','.join(route.methods)
    print(f"{route.path} [{methods}] -> {route.name}")

# Example endpoint to verify the server is running
@app.get("/api/hello")
async def say_hello():
    return {"message": "Hello from Asya!"}
