// src/components/MovieCardPlaceholder.js
import React from "react";
import "./MovieCardPlaceholder.css";

const MovieCardPlaceholder = ({ title }) => {
  return (
    <div className="movie-card">
      <div className="placeholder-image"></div>
      <h3 className="placeholder-title">{title}</h3>
    </div>
  );
};

export default MovieCardPlaceholder;