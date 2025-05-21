// frontend/src/components/MovieDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MovieDetail.css";
import { jwtDecode } from "jwt-decode";
import { logClick } from "../utils/clickLogger";

const MovieDetail = () => {
    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);

    const token = localStorage.getItem("access_token");
    const decoded = token ? jwtDecode(token) : null;
    const user_id = decoded ? parseInt(decoded.sub) : null;

    // Загрузка данных фильма (доступна всем)
    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const headers = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const response = await fetch(`http://localhost:8000/api/movies/${movieId}`, { headers });
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Фильм не найден");
                    }
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setMovie(data);

                 logClick("movie_view", {
                    movie_id: movieId
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movieId, token]);

    // Функция оценки фильма (только для авторизованных)
    const rateMovie = async (stars) => {
        if (!token) {
            setNotification("Сначала войдите в систему");
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/ratings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ movie_id: movie.id, rating: stars })
            });

            if (!response.ok) throw new Error("Ошибка сохранения рейтинга");

            logClick("rating_click", {
                movie_id: movie.id,
                rating: stars
              });

             setMovie(prev => ({ ...prev, user_rating: stars }));
        } catch (e) {
            console.error("Ошибка оценки:", e);
            setNotification("Не удалось сохранить рейтинг");
            setTimeout(() => setNotification(null), 3000);
        }
    };
    // Функция отметки "Просмотрено" (только для авторизованных)
    const handleWatched = async () => {
        if (!token) {
            setNotification("Сначала войдите в систему");
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/watch_history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ movie_id: movie.id })
            });

            if (!response.ok) throw new Error("Ошибка отметки просмотра");

                logClick("watched_click", {
                movie_id: movie.id
            });

            setMovie(prev => ({ ...prev, is_watched: true }));
        } catch (e) {
            console.error("Ошибка отметки просмотра:", e);
            setNotification("Не удалось отметить как просмотренный");
            setTimeout(() => setNotification(null), 3000);
        }
    };

    if (loading) return <p>Загрузка информации о фильме...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!movie) return <p>Фильм не найден</p>;

    return (
        <div className="movie-detail">
            {/* Уведомление */}
            {notification && <div className="notification">{notification}</div>}

            <div className="movie-poster">
                <img src={movie.poster_url || "https://example.com/default_poster.jpg "} alt={movie.title} />
            </div>

            <div className="movie-info">
                <h1>{movie.title}</h1>
                <p><strong>Год:</strong> {movie.release_year || "Неизвестен"}</p>
                <p><strong>Жанры:</strong> {movie.genres?.join(", ") || "Неизвестны"}</p>
                <p><strong>Средний рейтинг:</strong> {movie.avg_rating?.toFixed(1) || "Нет оценок"}</p>

                {/* Отображение личного рейтинга (только для авторизованных) */}
                {user_id && (
                    <div className="user-rating">
                        <p><strong>Ваш рейтинг:</strong> ★ {movie.user_rating ? movie.user_rating.toFixed(1) : "Не поставлен"}</p>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${star <= (movie.user_rating || 0) ? "selected" : ""}`}
                                    onClick={() => rateMovie(star)}
                                    style={{ cursor: token ? "pointer" : "not-allowed" }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Кнопка "Просмотреть" (только для авторизованных и непросмотренных фильмов) */}
                {token && !movie.is_watched && (
                    <button 
                        className="watch-button" 
                        onClick={handleWatched}
                    >
                        Просмотреть
                    </button>
                )}

                {/* Описание фильма */}
                <p className="description">{movie.description}</p>
            </div>
        </div>
    );
};

export default MovieDetail;