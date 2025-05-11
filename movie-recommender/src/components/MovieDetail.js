import React from "react";
import "./MovieDetail.css";

const MovieDetail = () => {
  // Статические данные о фильме
  const movie = {
    title: "Титаник",
    poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1773646/9ef93477-736c-4b5f-9cc8-3a602316efbd/3840x", // Замените на реальный URL постера
    releaseYear: 1997,
    genre: "Драма, Романтика",
    description: "Фильм рассказывает историю любви между Джеком и Розой, которые встречаются на корабле Титаник. Это один из самых известных фильмов всех времён.",
    rating: 4.8
  };

  return (
    <div className="movie-detail">
      <div className="movie-poster">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} />
        ) : (
          <div className="placeholder">Постер отсутствует</div>
        )}
      </div>

      <div className="movie-info">
        <h1 className="movie-title">{movie.title}</h1>
        <div className="movie-meta">
          <p className="release-year">Год выпуска: {movie.releaseYear}</p>
          <p className="genre">Жанр: {movie.genre}</p>
        </div>
        <p className="description">{movie.description}</p>
        
        <div className="rating-section">
          <p className="rating-label">Рейтинг фильма: {movie.rating}</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="star">★</span>
            ))}
          </div>
        </div>

        <div className="actions">
          <button className="watch-button">Просмотрено</button>
          <div className="rating-input">
            <label>Оцените фильм:</label>
            <input type="number" min="1" max="5" placeholder="1-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;