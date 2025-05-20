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
            return get_popular_movies(db)

        # Контентная фильтрация
        content_similarities, movie_indices = generate_content_recommendations(movies)
        print("[DEBUG] content_similarities.shape:", content_similarities.shape)

        # Коллаборативная фильтрация
        model, all_movies, user_ids, user_item, user_to_index = generate_collaborative_recommendations(all_ratings, movies)
        print(f"[DEBUG] user_ids содержит {user_id}: {user_id in user_ids}")

        # Проверка, есть ли пользователь в модели
        if user_id not in user_ids:
            print(f"[INFO] Пользователь {user_id} отсутствует в коллаборативной матрице")
            return get_popular_movies(db)

        # Получение индекса пользователя
        user_index = user_to_index[user_id]
        
        # Прогнозы для всех фильмов через ALS
        from implicit.als import AlternatingLeastSquares
        all_movie_scores = model.recommend(user_index, user_item[user_index], N=len(all_movies), filter_already_liked_items=True)

        # Формирование коллаборативных оценок
        collaborative_scores = np.zeros(len(all_movies))
        for idx, score in enumerate(all_movie_scores[0]):  # Используем индексы фильмов из recommend
            if idx < len(all_movies):
                collaborative_scores[idx] = score

        # Гибридные рекомендации
        hybrid_scores = content_similarities.mean(axis=1) * 0.5 + collaborative_scores * 0.5

        # Учет демографии
        user_profile = pd.read_sql(f"SELECT * FROM users WHERE user_id = {user_id}", db.connection())
        if not user_profile.empty:
            age = user_profile["age"].values[0]
            gender = user_profile["gender"].values[0]

            # Усиление драм для женщин старше 25
            if age >= 25 and gender == "F":
                drama_mask = movies["genres"].str.contains("Drama")
                hybrid_scores[drama_mask] *= 1.2

        # Формирование рекомендаций
        top_indices = hybrid_scores.argsort()[::-1][:10]
        recommendations = [int(all_movies[i]) for i in top_indices]
        recommendations = list(dict.fromkeys(recommendations))[:10]
        print(f"[DEBUG] Рекомендации для пользователя {user_id}:", recommendations)
        
        # Сохранение в БД
        save_recommendations_to_db(recommendations, user_id)
        return recommendations

    except Exception as e:
        print(f"Ошибка рекомендаций для пользователя {user_id}: {str(e)}")
        return get_popular_movies(db)