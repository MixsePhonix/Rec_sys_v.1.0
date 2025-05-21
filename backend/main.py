# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.movies import router as movies_router
from routers.ratings import router as ratings_router
from routers.admin import router as admin_router
from routers.watch_history import router as watch_history_router
from routers.user_recommendations import router as user_recommendations_router
from routers.click import router as click_router
from models import Base
from database import engine
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц
Base.metadata.create_all(bind=engine)

# Инициализация Redis для кеширования
@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost", encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

# Подключение маршрутов
app.include_router(auth_router, prefix="/api/user", tags=["profile"])
app.include_router(movies_router)
app.include_router(ratings_router)
app.include_router(watch_history_router)
app.include_router(user_recommendations_router)
app.include_router(click_router)
app.include_router(admin_router)