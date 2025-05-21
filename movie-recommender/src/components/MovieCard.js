// frontend/src/components/MovieCard.js
import React from "react";
import { Link } from "react-router-dom";
import { logClick } from "../utils/clickLogger";  // ✅ Импорт добавлен

const MovieCard = ({ movie }) => {
    const handleClick = () => {
        // ✅ Логируем клик по фильму
        logClick("movie_card_click", {
            movie_id: movie.id,
            title: movie.title
        });
    };

    return (
        <div className="movie-card" onClick={handleClick} style={{ cursor: "pointer" }}>
            <Link to={`/movie/${movie.id}`}>
                <img src={movie.poster} alt={movie.title} />
                <h3>{movie.title}</h3>
            </Link>
        </div>
    );
};

export default MovieCard;