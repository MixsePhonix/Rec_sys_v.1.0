# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from schemas import UserCreate, UserLogin, UserResponse
from pydantic import BaseModel
from models import User, Token
from database import get_db
from sqlalchemy import text
from dependencies import create_access_token, get_current_user
import bcrypt

from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import os
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class UserCreate(BaseModel):
    email: str
    password: str
    age: int
    gender: str
    zip_code: str
    occupation: int

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    email: str
    age: int
    gender: str
    zip_code: str
    occupation: int


@router.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    salt = bcrypt.gensalt().decode("utf-8")

    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        salt=salt,
        age=user.age,
        gender=user.gender,
        zip_code=user.zip_code,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(data={"sub": str(db_user.user_id)}, expires_delta=timedelta(minutes=15))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login")
async def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.checkpw(user.password.encode("utf-8"), db_user.password_hash.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    access_token = create_access_token(data={"sub": str(db_user.user_id)}, expires_delta=timedelta(minutes=15))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Получение профиля пользователя с оценками и историей просмотров
    """
    try:
        # ✅ Извлекаем user_id из словаря
        user_id = current_user["user_id"] if isinstance(current_user, dict) else current_user

        # Базовая информация о пользователе
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # ✅ Безопасный SQL-запрос с параметрами
        # Оцененные фильмы
        rated_query = text("""
            SELECT r.movie_id, m.title, r.rating, r.timestamp 
            FROM ratings r
            JOIN movies m ON r.movie_id = m.movie_id
            WHERE r.user_id = :user_id
            ORDER BY r.timestamp DESC
        """)
        rated_movies = db.execute(rated_query, {"user_id": user_id}).fetchall()
        
        # Просмотренные фильмы
        watched_query = text("""
            SELECT w.movie_id, m.title, w.watched_at 
            FROM watch_history w
            JOIN movies m ON w.movie_id = m.movie_id
            WHERE w.user_id = :user_id
            ORDER BY w.watched_at DESC
        """)
        watched_movies = db.execute(watched_query, {"user_id": user_id}).fetchall()
        
        return {
            "user": {
                "user_id": user.user_id,
                "email": user.email,
                "age": user.age,
                "gender": user.gender,
                "zip_code": user.zip_code,
                "occupation": user.occupation,
                "registration_date": user.registration_date,
                "is_admin": user.is_admin
            },
            "rated_movies": [
                {"movie_id": r[0], "title": r[1], "rating": r[2], "timestamp": r[3]}
                for r in rated_movies
            ],
            "watched_movies": [
                {"movie_id": w[0], "title": w[1], "watched_at": w[2]}
                for w in watched_movies
            ]
        }
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Ошибка загрузки профиля: {str(e)}")
        raise HTTPException(status_code=500, detail="Не удалось загрузить профиль")