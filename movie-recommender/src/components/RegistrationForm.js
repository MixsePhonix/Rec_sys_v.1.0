// RegistrationForm.js
import React, { useState } from "react";
import "./AuthForm.css";

const RegistrationForm = ({ onClose, onRegisterSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [zip_code, setZipCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, age, gender, zip_code }),
      });

      const data = await response.json();

      if (data.detail) {
        setError(data.detail);
      } else if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        onRegisterSuccess(); // ✅ Добавлено: вызов onRegisterSuccess
        onClose();
      } else {
        setError("Ошибка регистрации");
      }
    } catch (err) {
      setError("Не удалось связаться с сервером");
      console.error(err);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="form-title">Регистрация</h2>
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
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="number"
            placeholder="Возраст"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="form-input"
          />
          <input
            placeholder="Пол"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="form-input"
          />
          <input
            placeholder="ZIP-код"
            value={zip_code}
            onChange={(e) => setZipCode(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="form-button">Зарегистрироваться</button>
          <button type="button" onClick={onClose} className="form-button">Закрыть</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;