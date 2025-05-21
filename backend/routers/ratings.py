# routers/ratings.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Rating
from database import get_db
from dependencies import SECRET_KEY, ALGORITHM
from schemas import RatingCreate
from fastapi.security import OAuth2PasswordBearer
from dependencies import get_current_user
import jwt

router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")

@router.post("/ratings")
async def rate_movie(
    request: RatingCreate,  
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    request_obj: Request = None
):
    try:
        # Проверка диапазона рейтинга
        if request.rating < 1 or request.rating > 5:
            raise HTTPException(status_code=400, detail="Рейтинг должен быть от 1 до 5")

        # Сохранение рейтинга
        db.execute(text("""
            INSERT INTO ratings (user_id, movie_id, rating, timestamp)
            VALUES (:user_id, :movie_id, :rating, EXTRACT(EPOCH FROM NOW()))
            ON CONFLICT (user_id, movie_id) DO UPDATE SET
                rating = EXCLUDED.rating,
                timestamp = EXCLUDED.timestamp
        """), {
            "user_id": user_id,
            "movie_id": request.movie_id,
            "rating": request.rating
        })

        # ✅ Ручное логирование действия "rated"
        db.execute(text("""
            INSERT INTO user_actions (user_id, movie_id, action_type, ip_address, user_agent)
            VALUES (:user_id, :movie_id, 'rated', :ip_address, :user_agent)
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
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения рейтинга: {str(e)}")