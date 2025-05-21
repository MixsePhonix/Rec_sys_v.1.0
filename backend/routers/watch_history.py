# routers/watch_history.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import WatchHistory
from schemas import WatchHistoryCreate
from dependencies import get_db, SECRET_KEY, ALGORITHM
import jwt
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")

@router.post("/watch_history")
async def add_to_watch_history(
    request: WatchHistoryCreate,  
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Неверный токен")

        # Добавление в историю
        db.execute(text("""
            INSERT INTO watch_history (user_id, movie_id, watched_at)
            VALUES (:user_id, :movie_id, NOW())
            ON CONFLICT (user_id, movie_id) DO NOTHING
        """), {"user_id": user_id, "movie_id": request.movie_id})
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка добавления в историю: {str(e)}")
    
