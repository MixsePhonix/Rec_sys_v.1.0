# recommender/hybrid_filter.py
import numpy as np
import pandas as pd
from implicit.als import AlternatingLeastSquares
from recommender.content_filter import generate_content_recommendations
from recommender.collaborative_filter import generate_collaborative_recommendations
from recommender.utils import get_popular_movies, save_recommendations_to_db

def get_user_recommendations(db, user_id):
    """
    Гибридная рекомендательная система:
    1. Контентная фильтрация (TF-IDF + косинусное сходство)
    2. Коллаборативная фильтрация (ALS)
    3. Взвешенное среднее с учетом демографии
    """
    try:
        # Преобразование user_id в int
        user_id = int(user_id)
        
        # Загрузка данных
        movies = pd.read_sql("SELECT * FROM movies", db.connection())
        ratings = pd.read_sql(f"SELECT * FROM ratings WHERE user_id = {user_id}", db.connection())
        all_ratings = pd.read_sql("SELECT * FROM ratings", db.connection())

        # Проверка, есть ли рейтинги у пользователя
        if ratings.empty:
            print("[INFO] У пользователя нет оценок → используем популярные фильмы")
            return get_popular_movies(db)

        # Контентная фильтрация
        content_similarities, movie_indices = generate_content_recommendations(movies)
        print("[DEBUG] Контентная фильтрация активна")
        print(f"[DEBUG] content_similarities.shape: {content_similarities.shape}")
        print(f"[DEBUG] Первые 5 контентных оценок: {content_similarities.mean(axis=1).argsort()[::-1][:5]}")

        # Коллаборативная фильтрация
        model, all_users, all_movies, user_item, user_to_index, movie_to_index = generate_collaborative_recommendations(all_ratings, movies)
        print("[DEBUG] Коллаборативная фильтрация активна")
        print(f"[DEBUG] all_users содержит {user_id}: {user_id in all_users}")
        
        # Проверка, есть ли пользователь в модели
        if user_id not in all_users:
            print(f"[INFO] Пользователь {user_id} отсутствует в коллаборативной матрице → используем только контентные рекомендации")
            return [int(movies.iloc[i]["movie_id"]) for i in content_similarities.mean(axis=1).argsort()[::-1][:10]]

        # Получение индекса пользователя
        user_index = user_to_index[user_id]
        
        # Прогнозы для всех фильмов через ALS
        all_movie_scores = model.recommend(user_index, user_item[user_index], N=len(all_movies), filter_already_liked_items=True)
        print(f"[DEBUG] all_movie_scores: {all_movie_scores[:5]}")

        # ✅ Исправление: разделение `all_movie_scores` на индексы и оценки
        indices, scores = all_movie_scores  # Теперь работаем с двумя отдельными массивами

        # Формирование коллаборативных оценок
        collaborative_scores = np.zeros(len(all_movies))
        for idx, score in enumerate(indices):  # ✅ Используем индексы фильмов
            if idx < len(all_movies):
                collaborative_scores[idx] = scores[idx]  # ✅ Используем соответствующие оценки

        print(f"[DEBUG] collaborative_scores.shape: {collaborative_scores.shape}")
        print(f"[DEBUG] Первые 5 коллаборативных оценок: {collaborative_scores.argsort()[::-1][:5]}")

        # Гибридные рекомендации
        hybrid_scores = content_similarities.mean(axis=1) * 0.3 + collaborative_scores * 0.7
        print("[DEBUG] Гибридная формула применена: 0.3 * контент + 0.7 * коллаборативная")
        print(f"[DEBUG] hybrid_scores.shape: {hybrid_scores.shape}")
        print(f"[DEBUG] hybrid_scores[:5]: {hybrid_scores[:5]}")

        # Учет демографии
        user_profile = pd.read_sql(f"SELECT * FROM users WHERE user_id = {user_id}", db.connection())
        if not user_profile.empty:
            age = user_profile["age"].values[0]
            gender = user_profile["gender"].values[0]

            # Приоритет драмам для женщин старше 25
            if age >= 25 and gender == "F":
                drama_mask = movies["genres"].str.contains("Drama")
                hybrid_scores[drama_mask] *= 1.2
                print("[DEBUG] Демография применена: усиление драм для женщин старше 25")

        # Формирование рекомендаций
        top_indices = hybrid_scores.argsort()[::-1][:10]
        recommendations = [int(movies.iloc[i]["movie_id"]) for i in top_indices]
        recommendations = list(dict.fromkeys(recommendations))[:10]
        print(f"[DEBUG] Рекомендации для пользователя {user_id}:", recommendations)
        
        # Сохранение в БД
        save_recommendations_to_db(recommendations, user_id)
        return recommendations

    except Exception as e:
        print(f"Ошибка рекомендаций для пользователя {user_id}: {str(e)}")
        return get_popular_movies(db)