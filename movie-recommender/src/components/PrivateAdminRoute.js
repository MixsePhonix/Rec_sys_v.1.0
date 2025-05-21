// frontend/src/components/PrivateAdminRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";  // ✅ Добавлено

const PrivateAdminRoute = ({ element }) => {
    const navigate = useNavigate();  // ✅ Теперь доступен
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setIsAdmin(false);
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const profile = await fetch("http://localhost:8000/api/user/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                }).then(res => res.json());

                if (profile.user.is_admin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    navigate("/profile");
                }
            } catch (err) {
                setIsAdmin(false);
                navigate("/login");
            }
        };

        checkAdmin();
    }, [navigate]);

    if (isAdmin === null) return <p>Проверка прав администратора...</p>;
    return isAdmin ? element : <Navigate to="/profile" />;
};

export default PrivateAdminRoute;