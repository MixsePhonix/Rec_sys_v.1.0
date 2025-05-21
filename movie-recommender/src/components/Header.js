// frontend/src/components/Header.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";
import { logClick } from "../utils/clickLogger";

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
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

        // ✅ Логируем успешный вход
        logClick("login", {});
    };

    const handleRegisterSuccess = () => {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        setIsRegisterOpen(false);
        navigate("/");
    };

    const handleLogout = () => {
        // ✅ Логируем выход
        logClick("logout", {});

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        navigate("/");
    };

    // Обработчик поиска
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            // ✅ Логируем поисковой запрос
            logClick("search_query", {
                search_query: searchQuery
            });

            try {
                const response = await fetch(`http://localhost:8000/api/search/movies?query=${encodeURIComponent(searchQuery)}`);
                if (!response.ok) throw new Error("Ошибка поиска");

                const data = await response.json();
                setSearchResults(data);
            } catch (err) {
                console.error("Ошибка поиска:", err);
                setSearchResults([]);
            }
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

                {/* Результаты поиска */}
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map(movie => (
                            <div
                                key={movie.id}
                                className="search-result-item"
                                onClick={() => {
                                    navigate(`/movie/${movie.id}`);
                                    // ✅ Логируем клик по результату поиска
                                    logClick("search_result_click", {
                                        movie_id: movie.id,
                                        title: movie.title
                                    });
                                }}
                            >
                                {movie.title} ({movie.release_year})
                            </div>
                        ))}
                    </div>
                )}

                {/* Кнопки авторизации */}
                {isLoggedIn ? (
                    <>
                        <button className="auth-button" onClick={handleLogout}>Выйти</button>
                        <Link to="/profile" className="auth-button">Профиль</Link>
                    </>
                ) : (
                    <>
                        <button className="auth-button" onClick={() => {
                            setIsLoginOpen(true);
                            // ✅ Логируем открытие формы авторизации
                            logClick("auth_form_open", {
                                form_type: "login"
                            });
                        }}>Авторизация</button>

                        <button className="auth-button" onClick={() => {
                            setIsRegisterOpen(true);
                            // ✅ Логируем открытие формы регистрации
                            logClick("auth_form_open", {
                                form_type: "register"
                            });
                        }}>Регистрация</button>
                    </>
                )}
            </div>

            {/* Модальные окна */}
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