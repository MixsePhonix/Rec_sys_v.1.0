# routers/movies.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text  
from database import get_db
from models import Movie, Rating
from typing import List
from fastapi_cache.decorator import cache

router = APIRouter(prefix="/api")

@router.get("/popular-movies", include_in_schema=False)
@cache(expire=3600)  # Кэширование на 1 час
async def get_popular_movies(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT m.movie_id, m.title, AVG(r.rating) AS avg_rating
            FROM movies m
            JOIN ratings r ON m.movie_id = r.movie_id
            GROUP BY m.movie_id, m.title
            ORDER BY avg_rating DESC
            LIMIT 10;
        """)
        result = db.execute(query).fetchall()
        return [{"id": row[0], "title": row[1], "rating": round(row[2], 1)} for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки фильмов: {str(e)}")
    
@router.get("/movies/{movie_id}")
@cache(expire=3600) 
async def get_movie_details(movie_id: int, db: Session = Depends(get_db)):
    try:
        # SQL-запрос для получения данных фильма и его рейтинга
        query = text("""
            SELECT m.movie_id, m.title, m.release_year, m.genres, AVG(r.rating) AS avg_rating
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
            "genres": result[3],
            "rating": round(result[4], 1) if result[4] else "Нет оценок"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки фильма: {str(e)}")