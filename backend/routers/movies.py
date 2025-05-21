# routers/movies.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Movie
from sqlalchemy import text
from fastapi_cache.decorator import cache
from recommender.hybrid_filter import get_user_recommendations
# routers/movies.py
from dependencies import get_current_user

router = APIRouter(prefix="/api")

@router.get("/search/movies")
@cache(expire=3600) 
async def search_movies(query: str = "", db: Session = Depends(get_db)):
    if not query.strip():
        return []
    
    try:
        # Поиск по частичному совпадению 
        sql_query = text("""
            SELECT movie_id, title, release_year, genres
            FROM movies
            WHERE title ILIKE :search_query
            ORDER BY title
            LIMIT 10
        """)
        results = db.execute(sql_query, {"search_query": f"%{query}%"})
        
        return [
            {
                "id": row[0],
                "title": row[1],
                "release_year": row[2],
                "genres": row[3].split("|") if row[3] else []
            } for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка поиска: {str(e)}")

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
async def get_movie_details(movie_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    """
    Получение информации о фильме, включая:
    - Средний рейтинг
    - Рейтинг пользователя
    - Статус "Просмотрено"
    """
    try:
        # Получение данных фильма и среднего рейтинга
        query = text("""
            SELECT m.movie_id, m.title, m.release_year, m.genres,
                   AVG(r.rating) AS avg_rating,
                   ur.rating AS user_rating,
                   wh.watched_at IS NOT NULL AS is_watched
            FROM movies m
            LEFT JOIN ratings r ON m.movie_id = r.movie_id
            LEFT JOIN ratings ur ON m.movie_id = ur.movie_id AND ur.user_id = :user_id
            LEFT JOIN watch_history wh ON m.movie_id = wh.movie_id AND wh.user_id = :user_id
            WHERE m.movie_id = :movie_id
            GROUP BY m.movie_id, m.title, m.release_year, m.genres, ur.rating, wh.watched_at
        """)
        
        result = db.execute(query, {"movie_id": movie_id, "user_id": user_id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Фильм не найден")
        
        return {
            "id": result[0],
            "title": result[1],
            "release_year": result[2],
            "genres": result[3].split("|") if result[3] else [],
            "avg_rating": round(result[4], 1) if result[4] else None,
            "user_rating": result[5],
            "is_watched": result[6]
        }
    except Exception as e:
        print(f"[ERROR] Ошибка загрузки фильма: {str(e)}")
        raise HTTPException(status_code=500, detail="Не удалось загрузить данные фильма")


@router.get("/recommendations")
async def get_user_recommendations_api(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    recommendations = get_user_recommendations(db, user_id)
    return {"recommendations": recommendations}