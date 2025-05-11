import React from "react";
import "./BannerInfo.css";

const Banner = () => {
  return (
    <div className="banner">
      <div className="banner-content">
        <h1 className="banner-title">Фильмы, которые тебе нужны</h1>
        <p className="banner-subtitle">Выбирайте фильмы, которые вам понравятся</p>
        <button className="watch-button">Смотреть</button>
      </div>
    </div>
  );
};

export default Banner;