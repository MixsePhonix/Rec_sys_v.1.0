# recommender/collaborative_filter.py
from implicit.als import AlternatingLeastSquares
from scipy.sparse import csr_matrix
import pandas as pd
import numpy as np

def generate_collaborative_recommendations(ratings, movies):
    """
    Коллаборативная фильтрация через ALS (возврат прогнозов для всех фильмов)
    """
    try:
        # Преобразование user_id и movie_id в int
        ratings["user_id"] = ratings["user_id"].astype(int)
        ratings["movie_id"] = ratings["movie_id"].astype(int)
        movies["movie_id"] = movies["movie_id"].astype(int)

        # Уникальные пользователи и фильмы
        unique_users = ratings["user_id"].unique()
        unique_movies = movies["movie_id"].tolist()

        # Сопоставление ID с индексами матрицы
        user_to_index = {user: idx for idx, user in enumerate(unique_users)}
        movie_to_index = {movie: idx for idx, movie in enumerate(unique_movies)}

        # Создание разреженной матрицы пользователь-фильм
        user_indices = ratings["user_id"].map(user_to_index)
        movie_indices = ratings["movie_id"].map(movie_to_index)
        user_item = csr_matrix(
            (ratings["rating"], (user_indices, movie_indices)),
            shape=(len(unique_users), len(unique_movies))
        )

        # Обучение ALS
        model = AlternatingLeastSquares(factors=64, iterations=15, random_state=42)
        model.fit(user_item * 40)

        # Возврат модели, всех фильмов, пользователей, матрицы user_item и сопоставлений
        return model, unique_movies, unique_users, user_item, user_to_index
    except Exception as e:
        print(f"[ERROR] Ошибка коллаборативной фильтрации: {str(e)}")
        return None, [], [], None, {}