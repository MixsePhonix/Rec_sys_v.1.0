// frontend/src/components/LoginForm.js
import React, { useState } from "react";
import "./AuthForm.css";
import { logClick } from "../utils/clickLogger";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onClose, onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:8000/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
                onLoginSuccess();
                onClose();

                // ✅ Логируем успешный вход
                logClick("login", {});

                // ✅ Получаем профиль пользователя
                const profileResponse = await fetch("http://localhost:8000/api/user/profile", {
                    headers: { "Authorization": `Bearer ${data.access_token}` }
                });

                const profileData = await profileResponse.json();
                const user = profileData.user;

                // ✅ Проверяем, является ли пользователь админом
                if (user.is_admin) {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            } else {
                setError("Ошибка авторизации");
            }
        } catch (err) {
            setError("Не удалось связаться с сервером");
            console.error(err);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Авторизация</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                    <button type="submit" className="form-button">Войти</button>
                    <button type="button" onClick={onClose} className="form-button">Закрыть</button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;