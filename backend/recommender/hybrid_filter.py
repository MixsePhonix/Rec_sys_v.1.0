# recommender/hybrid_filter.py
import numpy as np
import pandas as pd
from recommender.content_filter import generate_content_recommendations
from recommender.utils import get_popular_movies, save_recommendations_to_db

def get_user_recommendations(db, user_id):
    """
    Только контентная фильтрация:
    1. Анализ оцененных фильмов
    2. Учет демографии
    3. Возврат рекомендаций на основе жанров и названий
    """
    try:
        # Загрузка данных
        movies = pd.read_sql("SELECT * FROM movies", db.connection())
        ratings = pd.read_sql(f"SELECT * FROM ratings WHERE user_id = {user_id}", db.connection())

        # Если у пользователя нет оценок — возвращаем популярные фильмы
        if ratings.empty:
            return get_popular_movies(db)

        # Контентная фильтрация
        content_similarities, movie_indices = generate_content_recommendations(movies)
        print("[DEBUG] content_similarities.shape:", content_similarities.shape)

        # Получение оцененных пользователем фильмов
        rated_movies = ratings["movie_id"].tolist()
        rated_indices = [movie_indices.get(m, -1) for m in rated_movies]
        rated_indices = [i for i in rated_indices if i != -1]

        # Расчёт сходства
        if rated_indices:
            hybrid_scores = content_similarities[rated_indices].sum(axis=0)
        else:
            hybrid_scores = content_similarities.mean(axis=0)

        # Учет демографии
        user_profile = pd.read_sql(f"SELECT * FROM users WHERE user_id = {user_id}", db.connection())
        if not user_profile.empty:
            age = user_profile["age"].values[0]
            gender = user_profile["gender"].values[0]

            # Приоритет драмам для женщин старше 25
            if age >= 25 and gender == "F":
                drama_mask = movies["genres"].str.contains("Drama")
                hybrid_scores[drama_mask] *= 1.2

        # Получение топ-10 рекомендаций
        top_indices = hybrid_scores.argsort()[::-1][:10]
        recommendations = [int(movies.iloc[i]["movie_id"]) for i in top_indices]  # ✅ Преобразование в int

        # Удаление дубликатов и ограничение до 10
        recommendations = list(dict.fromkeys(recommendations))[:10]
        print(f"[DEBUG] Рекомендации для пользователя {user_id}:", recommendations)

        # Сохранение в БД
        save_recommendations_to_db(recommendations, user_id)
        return recommendations

    except Exception as e:
        print(f"Ошибка рекомендаций для пользователя {user_id}: {str(e)}")
        return get_popular_movies(db)