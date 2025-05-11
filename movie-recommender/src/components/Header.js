// Header.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Проверка токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Функция для выхода
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">🎬</Link>
        <Link to="/" className="app-title">RamdomPlay</Link>
      </div>

      <div className="header-right">
        <input type="text" placeholder="Поиск..." className="search-bar" />
        {isLoggedIn ? (
          <>
            <button onClick={handleLogout} className="auth-button">Выйти</button>
            <Link to="/profile" className="auth-button">Профиль</Link>
          </>
        ) : (
          <>
            <button onClick={() => setIsLoginOpen(true)} className="auth-button">Авторизация</button>
            <button onClick={() => setIsRegisterOpen(true)} className="auth-button">Регистрация</button>
          </>
        )}
      </div>

      {isLoginOpen && (
        <LoginForm 
          onClose={() => setIsLoginOpen(false)} 
          onLoginSuccess={() => setIsLoggedIn(true)} 
        />
      )}
      {isRegisterOpen && (
        <RegistrationForm 
          onClose={() => setIsRegisterOpen(false)}
          onRegisterSuccess={() => setIsLoggedIn(true)} 
        />
      )}
    </header>
  );
};

export default Header;