# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from schemas import UserCreate, UserLogin, UserResponse
from pydantic import BaseModel
from models import User, Token
from database import get_db
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

# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db, create_access_token
from models import User
from schemas import UserCreate, UserLogin
import bcrypt

router = APIRouter()

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
async def get_profile(current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.user_id == current_user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    return {
        "email": db_user.email,
        "age": db_user.age,
        "gender": db_user.gender,
        "zip_code": db_user.zip_code,
        "occupation": db_user.occupation
    }