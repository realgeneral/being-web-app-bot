# app/main.py
from fastapi.routing import APIRoute
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers import logs, telegram, task, users
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
app.include_router(users, prefix="/api/users", tags=["users"])

app.mount("/", StaticFiles(directory="server/static", html=True), name="static")

for route in app.routes:
    if isinstance(route, APIRoute):
        methods = ','.join(route.methods)
        print(f"Route: {route.path} | Methods: {methods}")
    else:
        # Обработка других типов маршрутов (например, Mount)
        print(f"Route: {route.path} | Type: {type(route)}")

# Example endpoint to verify the server is running
@app.get("/api/hello")
async def say_hello():
    return {"message": "Hello from Asya!"}
