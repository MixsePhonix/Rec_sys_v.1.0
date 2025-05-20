# recommender/content_filter.py
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np

def generate_content_recommendations(movies):
    """
    Контентная фильтрация через TF-IDF и косинусное сходство
    """
    try:
        # Объединение жанров и названий
        movies["features"] = movies["genres"].str.replace("|", " ") + " " + movies["title"]
        
        # TF-IDF векторизация
        tfidf = TfidfVectorizer(stop_words="english")
        tfidf_matrix = tfidf.fit_transform(movies["features"])
        
        # Косинусное сходство между фильмами
        content_similarities = cosine_similarity(tfidf_matrix, tfidf_matrix)
        movie_indices = pd.Series(movies.index, index=movies["movie_id"].astype(int), dtype=int).drop_duplicates()
        
        # Убедимся, что возвращается numpy.ndarray
        if isinstance(content_similarities, pd.DataFrame):
            content_similarities = content_similarities.values
        
        return content_similarities, movie_indices
    except Exception as e:
        print(f"[ERROR] Ошибка контентной фильтрации: {str(e)}")
        return np.zeros((len(movies), len(movies))), pd.Series([], dtype=int)