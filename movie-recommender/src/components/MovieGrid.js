// src/components/MovieGrid.js
import React, { useEffect, useState } from "react";
import "./MovieGrid.css";
import { Link } from "react-router-dom";

import poster1 from "./assets/poster1.webp"; // Убедитесь, что имя файла совпадает
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
  

  // Статические постеры (замените на свои изображения)
const staticPosters = [poster1, poster2, poster3, poster4, poster5, poster6, poster7, poster8, poster9, poster10];

useEffect(() => {
  fetch("http://localhost:8000/api/popular-movies")
    .then(response => {
      console.log("Status:", response.status); // ✅ Лог статуса
      console.log("URL:", response.url); // ✅ Лог конечного URL
      if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const moviesWithPosters = data.map((movie, index) => ({
        id: movie.id || movie.movie_id,
        title: movie.title,
        rating: movie.rating || movie.avg_rating,
        poster: staticPosters[index % staticPosters.length]
      }));
      setMovies(moviesWithPosters);
      setLoading(false);
    })
    .catch(err => {
      console.error("Ошибка загрузки:", err); // ✅ Лог ошибки
      setError("Не удалось загрузить фильмы");
      setLoading(false);
    });
}, []);

  if (loading) return <p>Загрузка популярных фильмов...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <Link to={`/movie/${movie.id}`} key={movie.id}>
          <div className="movie-card">
            <img src={movie.poster} alt={movie.title} />
            <h3>{movie.title}</h3>
            <p>Рейтинг: {movie.rating?.toFixed(1) || "Нет оценок"}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MovieGrid;