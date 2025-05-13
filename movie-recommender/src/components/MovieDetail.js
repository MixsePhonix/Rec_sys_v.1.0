import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MovieDetail.css";

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(null); // ✅ Состояние для оценки пользователя

useEffect(() => {
  fetch(`http://localhost:8000/api/movies/${movieId}`)
    .then(response => {
      if (!response.ok) throw new Error("Фильм не найден");
      return response.json();
    })
    .then(data => {
      // ✅ Обработка жанров: убираем { и } и разделяем по | или , (в зависимости от формата)
      let genresArray = [];
      if (typeof data.genres === "string") {
        genresArray = data.genres.replace(/[{}]/g, "").split("|"); // Убираем {} и делим по |
      } else if (Array.isArray(data.genres)) {
        genresArray = data.genres;
      }

      setMovie({
        ...data,
        genres: genresArray
      });
      setLoading(false);
    })
    .catch(err => {
      setError("Не удалось загрузить данные фильма");
      setLoading(false);
    });
}, [movieId]);

  // ✅ Функция для оценки фильма
  const rateMovie = async (stars) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/user_actions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: 1, // Замените на реальный user_id из профиля
          movie_id: movie.id,
          action_type: "rating",
          rating: stars
        })
      });
      if (response.ok) {
        setUserRating(stars);
        alert(`Вы оценили фильм на ${stars} звёзд`);
      }
    } catch (err) {
      console.error("Ошибка оценки:", err);
    }
  };

  if (loading) return <p>Загрузка данных фильма...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Фильм не найден</p>;

  return (
    <div className="movie-detail">
      <div className="movie-poster">
        <img 
          src={movie.poster || "https://via.placeholder.com/300x450?text= Постер+отсутствует"} 
          alt={movie.title} 
        />
      </div>
      <div className="movie-info">
        <h2>{movie.title}</h2>
        <p><strong>Год выпуска:</strong> {movie.release_year || "Неизвестно"}</p>
        <p><strong>Жанры:</strong> {movie.genres?.join(", ") || "Неизвестны"}</p>
        <p><strong>Рейтинг:</strong> {movie.rating ? movie.rating.toFixed(1) : "Нет оценок"}</p>
        <button className="watch-button">Просмотрено</button>
        <div className="rating-section">
          <p>Оцените фильм:</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className="star" 
                onClick={() => rateMovie(star)} // ✅ Теперь rateMovie определён
                style={{ cursor: "pointer", color: star <= (userRating || 0) ? "gold" : "white" }}
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