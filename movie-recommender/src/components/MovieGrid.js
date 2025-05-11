// src/components/MovieGrid.js
import React from "react";
import "./MovieGrid.css";
import { Link } from "react-router-dom";

const MovieGrid = () => {
  // Статические данные для заглушек
  const movies = [
    { id: 1, title: "The Matrix", poster: "https://avatars.mds.yandex.net/get-mpic/4902598/2a0000019206de4aa6bf931c19baf8029518/orig" },
    { id: 2, title: "Inception", poster: "https://avatars.mds.yandex.net/i?id=7bb58ad655ee13eda00b5ff1308b21ca_l-5275490-images-thumbs&n=13 " },
    { id: 3, title: "Interstellar", poster: "https://cdn1.ozone.ru/s3/multimedia-7/6088773271.jpg " },
    { id: 4, title: "The Dark Knight", poster: "https://i.pinimg.com/736x/be/b1/d1/beb1d10d361a9a62bd2b806c1dc99953.jpg" },
    { id: 5, title: "Pulp Fiction", poster: "https://cdn1.ozone.ru/s3/multimedia-1-5/c600/6998379593.jpg " },
    { id: 6, title: "The Shawshank Redemption", poster: "https://via.placeholder.com/200x300 " },
    { id: 7, title: "The Godfather", poster: "https://via.placeholder.com/200x300 " },
    { id: 8, title: "Forrest Gump", poster: "https://via.placeholder.com/200x300 " },
  ];

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <Link to={`/movie/${movie.id}`}>
          <div key={movie.id} className="movie-card">
              <img src={movie.poster} alt={movie.title} />
              <h3>{movie.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MovieGrid;