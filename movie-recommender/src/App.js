import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Profile from "./components/Profile";
import BannerInfo from "./components/BannerInfo";
import MovieGrid from "./components/MovieGrid";
import CenteredContainer from "./components/CenteredContainer";
import MovieDetail from "./components/MovieDetail";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";


const refreshToken = async (navigate) => {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) return false;

  try {
    const response = await fetch("http://localhost:8000/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      return true;
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return false;
    }
  } catch (err) {
    console.error("Ошибка refresh:", err);
    return false;
  }
};

const PrivateRoute = ({ element }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          const refreshed = await refreshToken(navigate);
          setIsLoggedIn(refreshed);
        } else {
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoggedIn === null) return <p>Проверка авторизации...</p>;

  return isLoggedIn ? element : <Navigate to="/login" />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Header 
        isLoggedIn={isLoggedIn} 
        onLoginSuccess={handleLoginSuccess} 
        onLogout={handleLogout} 
      />
      <CenteredContainer>
        <div className="content">
          <Routes>
            <Route path="/" element={<><BannerInfo /><MovieGrid /></>} />
            <Route path="/movie/:movieId" element={<MovieDetail />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
            <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegistrationForm />} />
          </Routes>
        </div>
      </CenteredContainer>
    </Router>
  );
}

export default App;