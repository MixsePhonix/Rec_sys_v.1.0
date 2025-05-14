# routers/movies.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Movie
from sqlalchemy import text

router = APIRouter(prefix="/api")

@router.get("/movies/{movie_id}")
async def get_movie_details(movie_id: int, db: Session = Depends(get_db)):
    try:
        # SQL-запрос без проверки токена
        query = text("""
            SELECT m.movie_id, m.title, m.release_year, m.genres,
                   AVG(r.rating) AS avg_rating
            FROM movies m
            LEFT JOIN ratings r ON m.movie_id = r.movie_id
            WHERE m.movie_id = :movie_id
            GROUP BY m.movie_id, m.title, m.release_year, m.genres
        """)
        result = db.execute(query, {"movie_id": movie_id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Фильм не найден")
        
        return {
            "id": result[0],
            "title": result[1],
            "release_year": result[2],
            "genres": result[3].split("|") if result[3] else [],
            "rating": round(result[4], 1) if result[4] else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки: {str(e)}")