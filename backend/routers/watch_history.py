# routers/watch_history.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import WatchHistory
from schemas import WatchHistoryCreate
from dependencies import get_db, SECRET_KEY, ALGORITHM
from dependencies import get_current_user
import jwt
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")

@router.post("/watch_history")
async def add_to_watch_history(
    request: WatchHistoryCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),  # Получаем словарь
    request_obj: Request = None
):
    try:
        user_id = user["user_id"]  # ✅ Извлекаем только user_id из словаря

        # Добавляем в историю просмотров
        db.execute(text("""
            INSERT INTO watch_history (user_id, movie_id, watched_at)
            VALUES (:user_id, :movie_id, NOW())
            ON CONFLICT (user_id, movie_id) DO NOTHING
        """), {
            "user_id": user_id,
            "movie_id": request.movie_id
        })

        # Логируем действие
        db.execute(text("""
            INSERT INTO user_actions (user_id, movie_id, action_type, ip_address, user_agent)
            VALUES (:user_id, :movie_id, 'watched', :ip_address, :user_agent)
        """), {
            "user_id": user_id,
            "movie_id": request.movie_id,
            "ip_address": request_obj.client.host,
            "user_agent": request_obj.headers.get("User-Agent")
        })

        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка отметки просмотра: {str(e)}")
