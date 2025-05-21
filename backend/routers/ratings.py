# routers/ratings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Rating
from database import get_db
from dependencies import SECRET_KEY, ALGORITHM
from schemas import RatingCreate
from fastapi.security import OAuth2PasswordBearer
import jwt

router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

@router.post("/ratings")
async def rate_movie(
    request: RatingCreate,  
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    try:
        # Декодирование токена
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Неверный токен")

        # Проверка рейтинга
        if request.rating < 1 or request.rating > 5:
            raise HTTPException(status_code=400, detail="Рейтинг должен быть от 1 до 5")

        # Сохранение рейтинга как Unix-время в секундах
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
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения рейтинга: {str(e)}")