import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import schedule
import time
from recommender.hybrid_filter import get_user_recommendations
from recommender.utils import get_all_users, get_db, save_recommendations_to_db 

def retrain_all_users():
    """
    Переобучение рекомендаций для всех пользователей
    """
    try:
        # Получаем новую сессию БД
        db = next(get_db())
        
        # ✅ Получаем список всех пользователей из БД
        all_users = get_all_users(db)
        print(f"[INFO] Начало переобучения для {len(all_users)} пользователей")

        for user_id in all_users:
            try:
                #Новая сессия для каждого пользователя
                db_user = next(get_db())
                
                #Генерация рекомендаций для текущего пользователя
                recommendations = get_user_recommendations(db_user, user_id)
                print(f"[DEBUG] Рекомендации для {user_id}: {recommendations}")
                
                #Сохранение рекомендаций
                save_recommendations_to_db(recommendations, user_id)
            except Exception as e:
                print(f"[ERROR] Не удалось обновить рекомендации для {user_id}: {str(e)}")
            finally:
                db_user.close()

        print("[INFO] Переобучение завершено")
    except Exception as e:
        print(f"[ERROR] Критическая ошибка: {str(e)}")
    finally:
        db.close()

#Повтор каждые 24 часа
schedule.every(24).hours.do(retrain_all_users)

while True:
    schedule.run_pending()
    time.sleep(1)