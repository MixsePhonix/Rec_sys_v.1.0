// frontend/src/components/Banner.js
import React, { useState } from "react";
import "./BannerInfo.css";
import { useNavigate } from "react-router-dom";

const Banner = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleWatchRandomMovie = async () => {
        try {
            setLoading(true);
            setError("");

            // ✅ Загрузка списка всех фильмов
            const response = await fetch("http://localhost:8000/api/movies");
            if (!response.ok) {
                throw new Error("Не удалось загрузить фильмы");
            }

            const data = await response.json();
            if (data.length === 0) {
                setError("Нет доступных фильмов");
                return;
            }

            // ✅ Выбираем случайный фильм
            const randomIndex = Math.floor(Math.random() * data.length);
            const randomMovie = data[randomIndex];
            const movieId = randomMovie.id || randomMovie.movie_id;

            // ✅ Переход на страницу фильма
            navigate(`/movie/${movieId}`);
        } catch (err) {
            setError("Не удалось открыть фильм");
            console.error("Ошибка при выборе фильма:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="banner">
            <div className="banner-content">
                <h1 className="banner-title">Фильмы, которые тебе нужны</h1>
                <p className="banner-subtitle">Выбирайте фильмы, которые вам понравятся</p>
                <button
                    className="watch-button"
                    onClick={handleWatchRandomMovie}
                    disabled={loading}
                >
                    {loading ? "Загрузка..." : "Смотреть"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Banner;