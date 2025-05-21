# recommender/utils.py
import pandas as pd
from database import get_db
from models import Recommendation
from sqlalchemy import text
from datetime import datetime
from sqlalchemy.orm import Session


def get_popular_movies(db):
    """
    Возвращает популярные фильмы (по количеству оценок)
    """
    try:
        # Используем text() для SQL-запроса
        query = text("SELECT movie_id FROM ratings GROUP BY movie_id ORDER BY COUNT(*) DESC LIMIT 10")
        result = db.execute(query).fetchall()
        # Преобразование в int
        return [int(row[0]) for row in result]
    except Exception as e:
        print(f"Ошибка получения популярных фильмов: {str(e)}")
        return [1, 2, 3, 5, 8, 10, 12, 15, 18, 20]

def save_recommendations_to_db(recommendations, user_id):
    """
    Сохранение рекомендаций в таблицу `recommendations`
    """
    db = next(get_db())
    try:
        # Удаление старых рекомендаций
        db.query(Recommendation).filter(Recommendation.user_id == user_id).delete()
        
        # Сохранение новых рекомендаций
        for idx, movie_id in enumerate(recommendations):
            recommendation = Recommendation(
                user_id=user_id,
                movie_id=int(movie_id), 
                similarity_score=1.0 - idx * 0.1,
                recommendation_type="collaborative"
            )
            db.add(recommendation)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Ошибка сохранения рекомендаций: {str(e)}")

def get_all_users(db):
    """
    Получение всех пользователей из БД
    """
    query = text("SELECT DISTINCT user_id FROM ratings")
    result = db.execute(query).fetchall()
    return [int(row[0]) for row in result]


def get_movies_by_ids(db: Session, movie_ids: list):
    """
    Получение данных о фильмах по списку ID
    """
    if not movie_ids:
        return []
    
    movie_ids_str = ",".join(map(str, movie_ids))
    query = text(f"""
        SELECT * FROM movies 
        WHERE movie_id IN ({movie_ids_str})
        ORDER BY ARRAY_POSITION(ARRAY[{movie_ids_str}], movie_id)
    """)
    
    result = db.execute(query).fetchall()
    return [dict(row) for row in result]