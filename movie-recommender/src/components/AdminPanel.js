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
    const [pages, setPages] = useState(1);

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

                params.append("page", page);  // ✅ Передаем page в запросе

                const response = await fetch(`http://localhost:8000/api/admin/logs?${params.toString()}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        setError("Доступ запрещён");
                    }
                    throw new Error("Ошибка сервера");
                }

                const data = await response.json();
                setLogs(data.logs || []);
                setTotal(data.total || 0);
                setPages(Math.ceil(data.total / 10) || 1);  // ✅ Обновляем количество страниц
            } catch (err) {
                setError("Не удалось загрузить логи");
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [userId, ipAddress, page]);  // ✅ Теперь page влияет на обновление

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
                    onChange={(e) => setUserId(e.target.value)}
                    className="form-input"
                />
                <input
                    type="text"
                    placeholder="Фильтр по IP"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="form-input"
                />
            </div>

            {/* Таблица логов */}
            <div className="admin-section">
                <h2>Логи действий</h2>
                {loading ? (
                    <p>Загрузка логов...</p>
                ) : (
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
                )}
            </div>

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
    );
};

export default AdminPanel;