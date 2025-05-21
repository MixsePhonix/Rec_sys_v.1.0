# routers/clicks.py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import get_db
from sqlalchemy import text

router = APIRouter(prefix="/api")

@router.post("/clicks")
async def log_user_action(
    data: dict,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Логирует действия пользователя
    """
    try:
        user_id = data.get("user_id")
        movie_id = data.get("movie_id")
        action_type = data.get("action_type")
        search_query = data.get("search_query")
        form_type = data.get("form_type")

        # ✅ Убрано упоминание `action_subtype`
        db.execute(text("""
            INSERT INTO user_actions (
                user_id, movie_id, action_type, ip_address, user_agent, search_query, form_type
            ) VALUES (
                :user_id, :movie_id, :action_type, :ip_address, :user_agent, :search_query, :form_type
            )
        """), {
            "user_id": user_id,
            "movie_id": movie_id,
            "action_type": action_type,
            "ip_address": request.client.host,
            "user_agent": request.headers.get("User-Agent"),
            "search_query": search_query,
            "form_type": form_type
        })
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Не удалось записать клик: {str(e)}")
        return {"status": "partial_success"}