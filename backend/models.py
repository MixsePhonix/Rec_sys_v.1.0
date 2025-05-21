# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)  
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    zip_code = Column(String(50))
    occupation = Column(Integer)
    registration_date = Column(DateTime, default=datetime.utcnow)
    tokens = relationship("Token", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class Token(Base):
    __tablename__ = "tokens"
    token_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="tokens")

class Movie(Base):
    __tablename__ = "movies"
    movie_id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    genres = Column(String(255))
    rating_avg = Column(Float)

class WatchHistory(Base):
    __tablename__ = "watch_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    movie_id = Column(Integer, ForeignKey("movies.movie_id"))
    watched_at = Column(DateTime)

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    movie_id = Column(Integer, ForeignKey("movies.movie_id"))
    rating = Column(Integer)
    timestamp = Column(DateTime)

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    recommendation_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.movie_id"), nullable=False)  # ✅ Упрощаем: используем movie_id
    similarity_score = Column(Float)
    recommendation_type = Column(String(50), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="recommendations")
    movie = relationship("Movie", foreign_keys=[movie_id]) 

