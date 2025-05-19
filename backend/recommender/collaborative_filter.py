# recommender/collaborative_filter.py
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np

def generate_collaborative_recommendations(ratings, movies):
    """
    Коллаборативная фильтрация через косинусное сходство между пользователями
    """
    try:
        # Убедитесь, что все фильмы из ratings есть в movies
        valid_ratings = ratings[ratings["movie_id"].isin(movies["movie_id"])]
        
        # Фильтрация пользователей с минимум 10 оценками
        min_ratings = valid_ratings.groupby("user_id").filter(lambda x: len(x) >= 10)
        
        # Создание матрицы пользователь-фильм
        user_movie_matrix = min_ratings.pivot(index="user_id", columns="movie_id", values="rating").fillna(0)
        
        # Косинусное сходство между пользователями
        user_similarities = cosine_similarity(user_movie_matrix)
        user_similarities_df = pd.DataFrame(user_similarities, index=user_movie_matrix.index, columns=user_movie_matrix.index)
        
        # Возврат данных
        all_movies = user_movie_matrix.columns.tolist()
        user_ids = user_movie_matrix.index.tolist()
        return user_similarities_df, all_movies, user_ids
    except Exception as e:
        print(f"[ERROR] Ошибка коллаборативной фильтрации: {str(e)}")
        return np.zeros((len(movies), 10)), movies["movie_id"].tolist(), []