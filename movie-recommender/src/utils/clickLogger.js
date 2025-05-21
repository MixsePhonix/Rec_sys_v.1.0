// frontend/src/utils/clickLogger.js
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8000/api/clicks";

export const logClick = async (actionType, payload = {}) => {
    const token = localStorage.getItem("access_token");
    const decoded = token ? jwtDecode(token) : null;

    const data = {
        action_type: actionType,
        user_id: decoded?.sub || null,
        timestamp: new Date().toISOString(),
        ip_address: null,
        user_agent: navigator.userAgent,
        ...payload
    };

    try {
        await fetch("http://localhost:8000/api/clicks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
            body: JSON.stringify(data)
        });
    } catch (err) {
        console.warn(`Не удалось отправить событие "${actionType}":`, err);
    }
};