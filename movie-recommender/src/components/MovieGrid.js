// src/components/MovieGrid.js
import React, { useEffect, useState } from "react";
import "./MovieGrid.css";
import { Link } from "react-router-dom";

// Импорт статических постеров
import poster1 from "./assets/poster1.webp";
import poster2 from "./assets/poster2.webp";
import poster3 from "./assets/poster3.webp";
import poster4 from "./assets/poster4.webp";
import poster5 from "./assets/poster5.webp";
import poster6 from "./assets/poster6.webp";
import poster7 from "./assets/poster7.webp";
import poster8 from "./assets/poster8.webp";
import poster9 from "./assets/poster9.webp";
import poster10 from "./assets/poster10.webp";

const MovieGrid = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Статические постеры
    const staticPosters = [
        poster1, poster2, poster3, poster4, poster5,
        poster6, poster7, poster8, poster9, poster10
    ];

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const isAuth = !!token;
        const url = isAuth ? "http://localhost:8000/api/user/recommendations" : "http://localhost:8000/api/popular-movies";

        fetch(url, {
            headers: isAuth ? { "Authorization": `Bearer ${token}` } : {}
        })
            .then(response => {
                if (!response.ok) {
                    if (isAuth && response.status === 404) {
                        console.log("[INFO] Рекомендаций нет → возврат популярных фильмов");
                        return fetch("http://localhost:8000/api/popular-movies");
                    }
                    throw new Error(`Ошибка сети: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // ✅ Обработка данных в зависимости от эндпоинта
                const moviesData = isAuth && data.recommendations ? data.recommendations : data;

                // Добавление статических постеров
                const moviesWithPosters = moviesData.map((movie, index) => ({
                    ...movie,
                    poster: movie.poster || staticPosters[index % staticPosters.length]
                }));

                setMovies(moviesWithPosters);
                setLoading(false);
            })
            .catch(err => {
                console.error("Ошибка загрузки:", err);
                setError("Не удалось загрузить фильмы");
                setLoading(false);
            });
    }, [localStorage.getItem("access_token")]);  // Обновление при изменении токена

    if (loading) {
        return (
            <div className="movie-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
                    <div key={`placeholder-${index}`} className="movie-card">
                        <div className="placeholder-poster"></div>
                        <h3>Загрузка...</h3>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div className="movie-grid">
            {movies.map((movie, index) => (
                <Link to={`/movie/${movie.id}`} key={movie.id || index}>
                    <div className="movie-card">
                        <img 
                            src={movie.poster || staticPosters[index % staticPosters.length]} 
                            alt={movie.title} 
                        />
                        <h3>{movie.title}</h3>
                        <p>Рейтинг: {movie.rating?.toFixed(1) || "Нет оценок"}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default MovieGrid;