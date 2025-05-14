import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MovieDetail.css";
import { jwtDecode } from "jwt-decode";

// src/components/MovieDetail.js
const MovieDetail = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(null);
    const [notification, setNotification] = useState(null);

  const token = localStorage.getItem("access_token");
  const [userId, setUserId] = useState(null);

  // Получение user_id из токена
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.sub);
      } catch (err) {
        navigate("/login");
      }
    }
  }, [token, navigate]);

  // Загрузка данных фильма
  useEffect(() => {
    fetch(`http://localhost:8000/api/movies/${movieId}`)
      .then(response => {
        if (!response.ok) throw new Error("Фильм не найден");
        return response.json();
      })
      .then(data => {
        setMovie(data);
        setUserRating(data.user_rating || null);
        setLoading(false);
      })
      .catch(err => {
        setError("Не удалось загрузить данные фильма");
        setLoading(false);
      });
  }, [movieId]);

  // Отметка "Просмотрено"
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

    if (response.ok) {
      setNotification("Фильм добавлен в историю просмотров");
      setTimeout(() => setNotification(null), 3000);
    }
  } catch (err) {
    console.error("Ошибка добавления в историю:", err);
  }
};

  // Оценка фильма
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

    if (response.ok) {
      setUserRating(stars);
      setNotification(`Вы оценили фильм на ${stars} звёзд`);
      setTimeout(() => setNotification(null), 3000);
    }
  } catch (err) {
    console.error("Ошибка оценки:", err);
  }
};

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Фильм не найден</p>;

  return (
    <div className="movie-detail">
      {/* Уведомление */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <div className="movie-poster">
        <img src={movie.poster} alt={movie.title} />
      </div>

      <div className="movie-info">
        <h1>{movie.title}</h1>
        <p><strong>Год:</strong> {movie.release_year || "Неизвестно"}</p>
        <p><strong>Жанры:</strong> {movie.genres?.join(", ") || "Неизвестны"}</p>
        <p><strong>Рейтинг:</strong> {movie.rating?.toFixed(1) || "Нет оценок"}</p>

        {/* Кнопка "Просмотрено" */}
        {token && (
          <button className="watch-button" onClick={handleWatched}>
            Просмотрено
          </button>
        )}

        {/* Система оценок */}
        <div className="rating-section">
          <p>Оцените фильм:</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className="star"
                onClick={() => rateMovie(star)}
                style={{
                  cursor: token ? "pointer" : "not-allowed",
                  color: star <= (userRating || 0) ? "gold" : "white"
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;