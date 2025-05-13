# models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)  # ✅ Добавлено `autoincrement=True`
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    zip_code = Column(String(50))
    occupation = Column(Integer)
    registration_date = Column(DateTime, default=datetime.utcnow)
    tokens = relationship("Token", back_populates="user")

class Token(Base):
    __tablename__ = "tokens"
    token_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="tokens")