import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    setIsLoginOpen(false);
    navigate("/");
  };

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    setIsRegisterOpen(false);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
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
            <button className="auth-button" onClick={handleLogout}>Выйти</button>
            <Link to="/profile" className="auth-button">Профиль</Link>
          </>
        ) : (
          <>
            <button className="auth-button" onClick={() => setIsLoginOpen(true)}>Авторизация</button>
            <button className="auth-button" onClick={() => setIsRegisterOpen(true)}>Регистрация</button>
          </>
        )}
      </div>
      {isLoginOpen && (
        <LoginForm 
          onClose={() => setIsLoginOpen(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
      {isRegisterOpen && (
        <RegistrationForm 
          onClose={() => setIsRegisterOpen(false)} 
          onRegisterSuccess={handleRegisterSuccess} 
        />
      )}
    </header>
  );
};

export default Header;