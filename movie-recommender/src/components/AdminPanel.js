// frontend/src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import "./AdminPanel.css";
import { Link } from "react-router-dom";

const AdminPanel = () => {
    const [logs, setLogs] = useState([]);
    const [userId, setUserId] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);

    // ✅ Новые состояния для блокировки
    const [blockedUserId, setBlockedUserId] = useState("");
    const [blockError, setBlockError] = useState("");

    // ✅ Новые состояния для добавления фильма
    const [newTitle, setNewTitle] = useState("");
    const [newGenres, setNewGenres] = useState("");
    const [newYear, setNewYear] = useState("");
    const [addMovieError, setAddMovieError] = useState("");
    const [addMovieSuccess, setAddMovieSuccess] = useState("");

    // Получение логов
    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setError("Не авторизован");
                setLoading(false);
                return;
            }

            try {
                const params = new URLSearchParams();
                
                if (userId && userId.trim()) {
                    const num = parseInt(userId);
                    if (!isNaN(num)) {
                        params.append("user_id", num);
                    }
                }

                if (ipAddress && ipAddress.trim()) {
                    params.append("ip_address", ipAddress);
                }

                params.append("page", page);

                const response = await fetch(`http://localhost:8000/api/admin/logs?${params.toString()}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        setError("Доступ запрещён");
                    } else {
                        setError("Ошибка загрузки логов");
                    }
                    throw new Error("Ошибка сервера");
                }

                const data = await response.json();
                setLogs(data.logs || []);
                setTotal(data.total || 0);
                setPages(Math.ceil(data.total / 10) || 1);
            } catch (err) {
                setError("Не удалось загрузить логи");
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [userId, ipAddress, page]);

    // ✅ Функция для блокировки пользователя
    const handleBlock = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const id = parseInt(blockedUserId);
        if (!id || isNaN(id)) {
            setBlockError("Введите корректный ID пользователя");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/admin/users/${id}/block`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setBlockError(errorData.detail || "Ошибка при блокировке");
                return;
            }

            alert("Пользователь заблокирован");
            setBlockedUserId("");  // Очистка поля
            setPage(1);  // Сброс на первую страницу
            const updatedLogs = await fetch(`http://localhost:8000/api/admin/logs?user_id=${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            }).then(res => res.json());

            setLogs(updatedLogs.logs);
        } catch (err) {
            setBlockError("Не удалось заблокировать пользователя");
            console.error("Ошибка блокировки:", err);
        }
    };

    // ✅ Функция для разблокировки пользователя
    const handleUnblock = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const id = parseInt(blockedUserId);
        if (!id || isNaN(id)) {
            setBlockError("Введите корректный ID пользователя");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/admin/users/${id}/unblock`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setBlockError(errorData.detail || "Ошибка при разблокировке");
                return;
            }

            alert("Пользователь разблокирован");
            setBlockedUserId("");  // Очистка поля
            setPage(1);  // Сброс на первую страницу
            const updatedLogs = await fetch(`http://localhost:8000/api/admin/logs?user_id=${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            }).then(res => res.json());

            setLogs(updatedLogs.logs);
        } catch (err) {
            setBlockError("Не удалось разблокировать пользователя");
            console.error("Ошибка разблокировки:", err);
        }
    };

    // ✅ Функция для добавления фильма
    const handleAddMovie = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setAddMovieError("Не авторизован");
            return;
        }

        // ✅ Проверка обязательных полей
        if (!newTitle.trim() || !newYear.trim() || !newGenres.trim()) {
            setAddMovieError("Все поля обязательны");
            return;
        }

        const year = parseInt(newYear);
        if (year < 1800 || year > new Date().getFullYear() + 5) {
            setAddMovieError("Неверный год");
            return;
        }

        const genreList = newGenres.split(",").map(g => g.trim()).filter(Boolean);
        if (genreList.length === 0) {
            setAddMovieError("Укажите хотя бы один жанр");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/admin/movies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle,
                    release_year: year,
                    genres: genreList.join(",")  // ✅ Отправляем строку в формате "Sci-Fi,Drama"
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setAddMovieError(errorData.detail || "Не удалось добавить фильм");
                return;
            }

            const data = await response.json();
            setAddMovieSuccess(`Фильм добавлен! ID: ${data.movie_id}`);
            setNewTitle("");
            setNewGenres("");
            setNewYear("");
        } catch (err) {
            setAddMovieError("Не удалось связаться с сервером");
            console.error("Ошибка добавления фильма:", err);
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="admin-panel">
            <h1>Панель администратора</h1>

            {/* Форма фильтрации */}
            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Фильтр по user_id"
                    value={userId}
                    onChange={(e) => {
                        setUserId(e.target.value);
                        setPage(1);
                    }}
                    className="form-input"
                />
                <input
                    type="text"
                    placeholder="Фильтр по IP"
                    value={ipAddress}
                    onChange={(e) => {
                        setIpAddress(e.target.value);
                        setPage(1);
                    }}
                    className="form-input"
                />
            </div>

            {/* Таблица логов */}
            <div className="admin-section">
                <h2>Логи действий</h2>
                <table className="profile-table">
                    <thead>
                        <tr>
                            <th>Действие</th>
                            <th>Пользователь</th>
                            <th>IP</th>
                            <th>Дата</th>
                            <th>Поисковый запрос</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? (
                            logs.map((log, index) => (
                                <tr key={`log-${index}`}>
                                    <td>{log.action_type}</td>
                                    <td>{log.user_id || "—"}</td>
                                    <td>{log.ip_address}</td>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>{log.search_query || "—"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>Нет записей</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Пагинация */}
                {total > 10 && (
                    <div className="pagination">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                        >
                            ← Предыдущая
                        </button>
                        <span>Страница {page} из {pages}</span>
                        <button
                            onClick={() => setPage(Math.min(pages, page + 1))}
                            disabled={page === pages}
                        >
                            Следующая →
                        </button>
                    </div>
                )}
            </div>

            {/* Форма блокировки */}
            <div className="admin-section">
                <h2>Блокировка / Разблокировка пользователя</h2>
                <div className="block-form">
                    <input
                        type="text"
                        placeholder="Введите ID пользователя"
                        value={blockedUserId}
                        onChange={(e) => setBlockedUserId(e.target.value)}
                        className="form-input"
                    />
                    <div className="block-buttons">
                        <button
                            className="block-button"
                            onClick={handleBlock}
                        >
                            Заблокировать
                        </button>
                        <button
                            className="unblock-button"
                            onClick={handleUnblock}
                        >
                            Разблокировать
                        </button>
                    </div>
                    {blockError && <p style={{ color: "red" }}>{blockError}</p>}
                </div>
            </div>

            {/* Форма добавления фильма */}
            <div className="admin-section">
                <h2>Добавление нового фильма</h2>
                <div className="add-movie-form">
                    <input
                        type="text"
                        placeholder="Название фильма"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="form-input"
                    />
                    <input
                        type="text"
                        placeholder="Жанры (через запятую)"
                        value={newGenres}
                        onChange={(e) => setNewGenres(e.target.value)}
                        className="form-input"
                    />
                    <input
                        type="number"
                        placeholder="Год выпуска"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        className="form-input"
                    />
                    <button
                        className="form-button"
                        onClick={handleAddMovie}
                    >
                        Добавить фильм
                    </button>
                    {addMovieSuccess && <p style={{ color: "green" }}>{addMovieSuccess}</p>}
                    {addMovieError && <p style={{ color: "red" }}>{addMovieError}</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;