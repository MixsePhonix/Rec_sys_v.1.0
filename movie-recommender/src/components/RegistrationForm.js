import React, { useState } from "react";
import "./AuthForm.css";
import { useNavigate } from "react-router-dom";

const RegistrationForm = ({ onClose, onRegisterSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [zip_code, setZipCode] = useState("");
  const [occupation, setOccupation] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, age, gender, zip_code, occupation }),
      });
      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        onRegisterSuccess();
        onClose();
        navigate("/");
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
        <h2>Регистрация</h2>
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
          <select
            value={occupation}
            onChange={(e) => setOccupation(parseInt(e.target.value))}
            className="form-input"
          >
            <option value="0">other</option>
            <option value="1">academic/educator</option>
            <option value="2">artist</option>
            <option value="3">clerical/admin</option>
            <option value="4">college/grad student</option>
            <option value="5">customer service</option>
            <option value="6">doctor/health care</option>
            <option value="7">executive/managerial</option>
            <option value="8">farmer</option>
            <option value="9">homemaker</option>
            <option value="10">K-12 student</option>
            <option value="11">lawyer</option>
            <option value="12">programmer</option>
            <option value="13">retired</option>
            <option value="14">sales/marketing</option>
            <option value="15">scientist</option>
          </select>
          <button type="submit" className="form-button">Зарегистрироваться</button>
          <button type="button" onClick={onClose} className="form-button">Закрыть</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;