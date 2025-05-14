import React, { useState, useEffect } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
    setIsLoginOpen(false);
    navigate("/");
  };

  // Обработчик поиска с debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`http://localhost:8000/api/search/movies?query=${encodeURIComponent(searchQuery)}`)
        .then(response => {
          if (!response.ok) throw new Error("Ошибка поиска");
          return response.json();
        })
        .then(data => {
          setSearchResults(data);
        })
        .catch(err => {
          console.error("Ошибка поиска:", err);
          setSearchResults([]);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">🎬</Link>
        <Link to="/" className="app-title">RamdomPlay</Link>
      </div>

      <div className="header-right">
        {/* Поле поиска */}
        <input
          type="text"
          placeholder="Поиск..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Выпадающие результаты поиска */}
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(movie => (
              <div
                key={movie.id}
                className="search-result-item"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                {movie.title} ({movie.release_year})
              </div>
            ))}
          </div>
        )}

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