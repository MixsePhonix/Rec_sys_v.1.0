# recommender/tasks.py
from celery import Celery
from recommender.hybrid_filter import get_user_recommendations
from database import get_db
from recommender.utils import save_recommendations_to_db
import pandas as pd

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task
def retrain_models():
    """
    Фоновое переобучение модели и обновление рекомендаций
    """
    db = next(get_db())
    movies = pd.read_sql("SELECT * FROM movies", db.connection())
    ratings = pd.read_sql("SELECT * FROM ratings", db.connection())
    
    for user_id in ratings["user_id"].unique():
        recommendations = get_user_recommendations(db, user_id)
        save_recommendations_to_db(recommendations, user_id)