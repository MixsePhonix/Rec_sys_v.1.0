# schemas.py
from pydantic import BaseModel

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