# routers/admin.py
from fastapi import APIRouter, Depends, HTTPException,  Query
from sqlalchemy.orm import Session
from database import get_db
from sqlalchemy import text
from dependencies import get_current_user
from typing import Optional
from models import UserAction, User, Movie
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel


router = APIRouter(prefix="/api/admin")

def check_admin(user: dict = Depends(get_current_user)):
    if not user["is_admin"]:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    
class CreateMovieRequest(BaseModel):
    title: str
    release_year: int
    genres: str  

@router.get("/users")
async def get_all_users(db: Session = Depends(get_db), user: dict = Depends(check_admin)):
    check_admin(user)
    users = db.execute(text("SELECT user_id, email, is_admin FROM users")).fetchall()
    return {"users": users}

@router.post("/users/{user_id}/toggle-admin")
async def toggle_admin_status(user_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    check_admin(user)
    result = db.execute(text("SELECT is_admin FROM users WHERE user_id = :user_id"), {"user_id": user_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    new_status = not result[0]
    db.execute(text("UPDATE users SET is_admin = :status WHERE user_id = :user_id"), {"status": new_status, "user_id": user_id})
    db.commit()
    return {"status": new_status}

@router.get("/logs")
async def get_user_actions(
    db: Session = Depends(get_db),
    user: dict = Depends(check_admin),
    user_id: Optional[int] = Query(None),
    ip_address: Optional[str] = Query(None),
    page: int = Query(1, ge=1)  # ✅ Добавлен параметр page
):
    """
    Получение логов действий с фильтрацией и пагинацией
    """
    try:
        query = db.query(UserAction)
        if user_id:
            query = query.filter(UserAction.user_id == user_id)
        if ip_address:
            query = query.filter(UserAction.ip_address == ip_address)

        # ✅ Используем page для пагинации
        offset = (page - 1) * 10
        total = query.count()
        logs = query.order_by(UserAction.timestamp.desc()).offset(offset).limit(10).all()

        return {
            "logs": logs,
            "total": total,
            "page": page,
            "pages": (total + 9) // 10
        }
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Не удалось получить логи: {str(e)}")
        raise HTTPException(status_code=500, detail="Ошибка загрузки логов")
    
@router.post("/users/{user_id}/block")
async def block_user(user_id: int, db: Session = Depends(get_db), user: dict = Depends(check_admin)):
    """
    Блокирует пользователя
    """
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if db_user.is_blocked:
        raise HTTPException(status_code=400, detail="Пользователь уже заблокирован")

    db_user.is_blocked = True
    db.commit()
    return {"status": "success", "message": "Пользователь заблокирован"}

@router.post("/users/{user_id}/unblock")
async def unblock_user(user_id: int, db: Session = Depends(get_db), user: dict = Depends(check_admin)):
    """
    Разблокирует пользователя
    """
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if not db_user.is_blocked:
        raise HTTPException(status_code=400, detail="Пользователь не заблокирован")

    db_user.is_blocked = False
    db.commit()
    return {"status": "success", "detail": "Пользователь разблокирован"}

@router.post("/movies")
async def add_movie(
    request: CreateMovieRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(check_admin)
):
    """
    Добавление фильма по title, genres (через запятую), release_year
    """
    try:
        # Проверка дубликатов
        existing = db.query(Movie).filter(
            Movie.title == request.title,
            Movie.release_year == request.release_year
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Такой фильм уже существует")

        # Преобразование жанров в формат PostgreSQL-массива
        pg_genres = "{" + ",".join(genre.strip() for genre in request.genres.split(",")) + "}"

        # Создание нового фильма
        new_movie = Movie(
            title=request.title,
            release_year=request.release_year,
            genres=pg_genres
        )
        db.add(new_movie)
        db.commit()
        db.refresh(new_movie)

        return {"status": "success", "movie_id": new_movie.movie_id}
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Не удалось добавить фильм: {str(e)}")
        raise HTTPException(status_code=500, detail="Ошибка добавления фильма")