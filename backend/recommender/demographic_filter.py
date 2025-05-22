# recommender/demographic_filter.py
from sqlalchemy.orm import Session
import pandas as pd
from recommender.utils import get_popular_movies
import logging
from sqlalchemy import text

# Карта профессий → жанры
occupation_map = {
    0: ["other"],
    1: ["academic/educator", "documentary"],
    2: ["artist", "art"],
    3: ["clerical/admin", "drama"],
    4: ["college/grad student", "comedy", "animation"],
    5: ["customer service", "comedy", "drama"],
    6: ["doctor/health care", "medical", "drama"],
    7: ["executive/manager", "business", "thriller"],
    8: ["farmer", "nature", "documentary"],
    9: ["homemaker", "family", "comedy"],
    10: ["K-12 student", "animation", "sci-fi"],
    11: ["lawyer", "crime", "drama"],
    12: ["programmer", "sci-fi", "technology"],
    13: ["retired", "classic", "drama"],
    14: ["sales/marketing", "romance", "comedy"],
    15: ["scientist", "sci-fi", "documentary"]
}


def generate_demographic_recommendations(db: Session, user_id: int):
    """
    Генерация рекомендаций на основе демографии
    """
    try:
        # Получаем профиль пользователя
        user_profile = db.execute(text("SELECT age, gender, occupation FROM users WHERE user_id = :user_id"), {"user_id": user_id}).fetchone()
        if not user_profile:
            return get_popular_movies(db)

        age, gender, occupation = user_profile

        # Формируем жанры на основе демографии
        genres = []
        if gender == "F" and 18 <= age <= 35:
            genres.extend(["Drama", "Comedy"])
        elif gender == "M" and 18 <= age <= 30:
            genres.extend(["Action", "Thriller"])
        
        # Добавляем жанры по профессии
        if occupation in occupation_map:
            genres.extend(occupation_map[occupation])
        else:
            genres.append("other")

        genres = list(set(genres))  # Убираем дубликаты

        # ✅ Проверка: если жанры пустые → возвращаем популярные фильмы
        if not genres:
            return get_popular_movies(db)

        # ✅ Используем ILIKE для поиска по жанрам (вместо &&)
        query = text("""
            SELECT movie_id 
            FROM movies 
            WHERE genres ILIKE ANY(:genres)
            ORDER BY random() LIMIT 10
        """)
        
        # ✅ Добавляем кавычки к жанрам для ILIKE
        formatted_genres = [f"%{g}%" for g in genres]
        result = db.execute(query, {"genres": formatted_genres}).fetchall()
        
        # ✅ Если нет совпадений → возвращаем популярные фильмы
        if not result:
            print(f"[INFO] Нет фильмов по жанрам {genres} → возвращаем популярные")
            return get_popular_movies(db)
        
        return [int(row[0]) for row in result]
    except Exception as e:
        print(f"[ERROR] Не удалось сгенерировать рекомендации: {str(e)}")
        return get_popular_movies(db)