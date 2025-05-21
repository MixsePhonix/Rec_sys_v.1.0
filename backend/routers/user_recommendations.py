# routers/user_recommendations.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Recommendation
from dependencies import get_current_user, get_db
from recommender.utils import get_movies_by_ids
import jwt
import redis
import json

router = APIRouter()

# Подключение к Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

def get_user_recommendations_from_redis_or_db(db: Session, user_id: int):
    """
    Получение рекомендаций из Redis или БД
    """
    try:
        # Попытка получить из Redis
        cached = redis_client.get(f"recommendations:{user_id}")
        if cached:
            print(f"[DEBUG] Рекомендации для {user_id} взяты из Redis")
            return json.loads(cached)

        # Если нет — ищем в БД
        recommendations = db.query(Recommendation).filter(Recommendation.user_id == user_id).all()
        if not recommendations:
            from recommender.utils import get_popular_movies
            print(f"[INFO] Нет рекомендаций для {user_id} → возврат популярных фильмов")
            return get_popular_movies(db)
        
        # Сохранение в Redis
        movie_ids = [r.movie_id for r in recommendations]
        redis_client.setex(f"recommendations:{user_id}", 3600, json.dumps(movie_ids))
        print(f"[DEBUG] Рекомендации для {user_id} взяты из БД и закэшированы")
        return movie_ids
    except Exception as e:
        print(f"[ERROR] Ошибка работы с БД: {str(e)}")
        return []

@router.get("/api/user/recommendations")
def get_user_recommendations(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Получение рекомендаций с вычислением среднего рейтинга через ratings
    """
    try:
        # ✅ Извлекаем user_id из словаря
        user_id = current_user["user_id"] if isinstance(current_user, dict) else current_user

        recommendations = get_user_recommendations_from_redis_or_db(db, user_id)
        if not recommendations:
            raise HTTPException(status_code=404, detail="Рекомендации не найдены")

        # ✅ Безопасный SQL-запрос через параметризацию
        movie_ids = list(set(recommendations))  # Убираем дубликаты
        query = text("""
            SELECT m.movie_id, m.title, COALESCE(AVG(r.rating), 0.0) AS rating
            FROM movies m
            LEFT JOIN ratings r ON m.movie_id = r.movie_id
            WHERE m.movie_id IN :movie_ids
            GROUP BY m.movie_id, m.title
            ORDER BY m.movie_id
        """)
        result = db.execute(query, {"movie_ids": tuple(movie_ids)}).fetchall()

        # Форматируем результат
        formatted_result = [
            {"id": row[0], "title": row[1], "rating": round(float(row[2]), 1)}
            for row in result
        ]

        return {"user_id": user_id, "recommendations": formatted_result}
    except Exception as e:
        print(f"[ERROR] Ошибка получения рекомендаций: {str(e)}")
        raise HTTPException(status_code=404, detail="Рекомендации не найдены")