import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [occupationMap, setOccupationMap] = useState({
    0: "other",
    1: "academic/educator",
    2: "artist",
    3: "clerical/admin",
    4: "college/grad student",
    5: "customer service",
    6: "doctor/health care",
    7: "executive/managerial",
    8: "farmer",
    9: "homemaker",
    10: "K-12 student",
    11: "lawyer",
    12: "programmer",
    13: "retired",
    14: "sales/marketing",
    15: "scientist",
  });

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/profile", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const data = await response.json();
        if (data.email) {
          setUser(data);
        } else {
          setError("Данные пользователя не найдены");
        }
      } catch (err) {
        setError("Ошибка загрузки профиля");
        console.error("Ошибка:", err);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return <div>Загрузка...</div>;

  return (
    <div className="profile-container">
      <h2>Профиль</h2>
      <div className="profile-info">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Возраст:</strong> {user.age}</p>
        <p><strong>Пол:</strong> {user.gender}</p>
        <p><strong>ZIP-код:</strong> {user.zip_code}</p>
        <p><strong>Занятость:</strong> {occupationMap[user.occupation]}</p>
      </div>
    </div>
  );
};

export default Profile;