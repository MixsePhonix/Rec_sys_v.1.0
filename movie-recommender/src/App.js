import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Profile from "./components/Profile";
import BannerInfo from "./components/BannerInfo";
import MovieGrid from "./components/MovieGrid";
import CenteredContainer from "./components/CenteredContainer";
import MovieDetail from "./components/MovieDetail";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";

// Защищённый маршрут
const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <CenteredContainer>
          <div className="content">
            <Routes>
              {/* Главная страница */}
              <Route
                path="/"
                element={
                  <>
                    <BannerInfo />
                    <MovieGrid />
                  </>
                }
              />

              {/* Страница деталей фильма */}
              <Route path="/movie/:movieId" element={<MovieDetail />} />

              {/* Защищённая страница профиля */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute element={<Profile />} />
                }
              />

              <Route path="/login" element={<LoginForm />} />

              {/* Страница регистрации */}
              <Route path="/register" element={<RegistrationForm />} />
            </Routes>
          </div>
        </CenteredContainer>
      </Router>
    </div>
  );
}

export default App;