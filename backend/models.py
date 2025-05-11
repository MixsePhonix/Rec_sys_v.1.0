# models.py
from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True) 
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    salt = Column(String(255), nullable=False)  
    age = Column(Integer)
    gender = Column(String(10)) 
    zip_code = Column(String(50)) 
    occupation = Column(Integer) 
    registration_date = Column(DateTime, default=datetime.utcnow)