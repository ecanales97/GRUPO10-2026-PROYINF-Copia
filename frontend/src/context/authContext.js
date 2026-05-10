import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "utils/backend";
import { handleData } from "utils/handlers";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // FETCH DATA
    const fetchMe = async (token) => {
        const res = await fetch(`${backendUrl}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error(res.error || "Token inválido");

        return res.json();
    };

    // INIT AUTH
    useEffect(() => {
        const init = async () => {
            const storedToken = localStorage.getItem("token");

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const me = await fetchMe(storedToken);

                setToken(storedToken);
                setUser(me);

            } catch {
                localStorage.removeItem("token");
                setUser(null);
                setToken(null);
            }

            setLoading(false);
        };

        init();
    }, []);

    // LOGIN
    const login = async (formData) => {
        try {
            setError(null);

            const res = await fetch(`${backendUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(handleData(formData))
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem("token", data.token);

            const me = await fetchMe(data.token);

            setToken(data.token);
            setUser(me);

            return { ok: true };

        } catch (err) {
            setError(err.message);
            return { ok: false, error: err.message };
        }
    };

    // REFRESH USER DATA
    const refreshUser = async () => {
        if (!token) return;

        try {
            const me = await fetchMe(token);
            setUser(me);
        } catch {
            logout();
        }
    };

    // REGISTER
    const register = async (formData) => {
        try {
            setError(null);

            const res = await fetch(`${backendUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(handleData(formData))
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            return { ok: true };

        } catch (err) {
            setError(err.message);
            return { ok: false, error: err.message };
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        navigate("/iniciar-sesion");
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
            refreshUser,
            loading,
            error,
            isAuthenticated: !!user
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};