# recommender/utils.py
import pandas as pd
from database import get_db
from models import Recommendation
from sqlalchemy import text
from datetime import datetime


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
    db = next(get_db())
    try:
        # Удаление старых рекомендаций
        db.query(Recommendation).filter(Recommendation.user_id == user_id).delete()
        
        # Сохранение новых рекомендаций
        for idx, movie_id in enumerate(recommendations):
            recommendation = Recommendation(
                user_id=user_id,
                movie_id=int(movie_id),  # ✅ Используем movie_id вместо recommended_movie_id
                similarity_score=1.0 - (idx * 0.1),
                recommendation_type="hybrid"
            )
            db.add(recommendation)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Ошибка сохранения рекомендаций: {str(e)}")