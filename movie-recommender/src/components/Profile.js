// frontend/src/components/Profile.js
import React, { useEffect, useState } from "react";
import "./Profile.css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { logClick } from "../utils/clickLogger";

const occupationMap = {
    0: "other", 1: "academic/educator", 2: "artist", 3: "clerical/admin",
    4: "college/grad student", 5: "customer service", 6: "doctor/health care",
    7: "executive/manager", 8: "farmer", 9: "homemaker", 10: "K-12 student",
    11: "lawyer", 12: "programmer", 13: "retired", 14: "sales/marketing",
    15: "scientist"
};

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [rated, setRated] = useState([]);
    const [watched, setWatched] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Пагинация
    const [ratedPage, setRatedPage] = useState(1);
    const [watchedPage, setWatchedPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/api/user/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        navigate("/login");
                    } else if (response.status === 403) {
                        setError("Ваш аккаунт заблокирован");
                    }
                    return;
                }

                const data = await response.json();
                setUser(data.user);

                // ✅ Проверка, является ли пользователь админом
                if (data.user.is_admin) {
                    navigate("/admin");  // ✅ Редирект в админку
                    return;
                }

                // Если не админ → продолжаем загрузку профиля
                setRated(data.rated_movies);
                setWatched(data.watched_movies);
                setLoading(false);
            } catch (err) {
                setError("Не удалось загрузить профиль");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) return <p>Загрузка профиля...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!user) return <p>Пользователь не найден</p>;

    const ratedPages = Math.ceil(rated.length / itemsPerPage);
    const watchedPages = Math.ceil(watched.length / itemsPerPage);

    const currentRated = rated.slice((ratedPage - 1) * itemsPerPage, ratedPage * itemsPerPage);
    const currentWatched = watched.slice((watchedPage - 1) * itemsPerPage, watchedPage * itemsPerPage);

    return (
        <div className="profile-container">
            <h2>Профиль пользователя</h2>
            <div className="user-info">
                <p><strong>ID:</strong> {user.user_id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Возраст:</strong> {user.age || "Не указан"}</p>
                <p><strong>Пол:</strong> {user.gender || "Не указан"}</p>
                <p><strong>Дата регистрации:</strong> {new Date(user.registration_date).toLocaleDateString()}</p>
            </div>

            <h3>Оцененные фильмы</h3>
            {rated.length > 0 ? (
                <>
                    <table className="profile-table">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Рейтинг</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRated.map((movie, index) => (
                                <tr key={`rated-${index}`}>
                                    <td><Link to={`/movie/${movie.movie_id}`}>{movie.title}</Link></td>
                                    <td>★ {movie.rating.toFixed(1)}</td>
                                    <td>{new Date(movie.timestamp * 1000).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button 
                            onClick={() => setRatedPage(Math.max(1, ratedPage - 1))} 
                            disabled={ratedPage === 1}
                        >
                            ← Предыдущая
                        </button>
                        <span>Страница {ratedPage} из {ratedPages}</span>
                        <button 
                            onClick={() => setRatedPage(Math.min(ratedPages, ratedPage + 1))} 
                            disabled={ratedPage === ratedPages}
                        >
                            Следующая →
                        </button>
                    </div>
                </>
            ) : (
                <p>Нет оцененных фильмов</p>
            )}

            <h3>Просмотренные фильмы</h3>
            {watched.length > 0 ? (
                <>
                    <table className="profile-table">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Дата просмотра</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentWatched.map((movie, index) => (
                                <tr key={`watched-${index}`}>
                                    <td><Link to={`/movie/${movie.movie_id}`}>{movie.title}</Link></td>
                                    <td>{new Date(movie.watched_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button 
                            onClick={() => setWatchedPage(Math.max(1, watchedPage - 1))} 
                            disabled={watchedPage === 1}
                        >
                            ← Предыдущая
                        </button>
                        <span>Страница {watchedPage} из {watchedPages}</span>
                        <button 
                            onClick={() => setWatchedPage(Math.min(watchedPages, watchedPage + 1))} 
                            disabled={watchedPage === watchedPages}
                        >
                            Следующая →
                        </button>
                    </div>
                </>
            ) : (
                <p>Нет просмотренных фильмов</p>
            )}
        </div>
    );
};

export default Profile;