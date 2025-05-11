// LoginForm.js
import React, { useState, useEffect } from "react";
import "./AuthForm.css";

const LoginForm = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [error, setError] = useState("");

  // Закрытие модального окна при клике на фон
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains("modal") && isModalOpen) {
        onClose();
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose, isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.detail) {
        setError(data.detail);
      } else if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        onLoginSuccess(); // ✅ Добавлено: вызов onLoginSuccess
        onClose();
      } else {
        setError("Ошибка авторизации");
      }
    } catch (err) {
      setError("Не удалось связаться с сервером");
      console.error(err);
    }
  };

  return (
    <div className={`modal ${isModalOpen ? "active" : ""}`}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">Авторизация</h2>
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