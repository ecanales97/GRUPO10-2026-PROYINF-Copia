import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef
} from "react";

import { useNavigate } from "react-router-dom";
import Modal from "components/Modal";

import { handleData } from "utils/handlers";
import { createFetch } from "utils/general";
import PATH from "config/paths";

const HAS_SESSION_KEY = "hasSession";
const api = createFetch({ credentials: "include" });

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const isInvalidSession = (err) => err?.code === "INVALID_USER" || err?.code === "EXPIRED_SESSION";

const IDLE_LIMIT = 5 * 60 * 1000; // 15 min
const WARNING_TIME = 10 * 60 * 1000; // 20 min
const ABSOLUTE_EXPIRY = 15 * 60 * 1000; // 25 min

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showSessionModal, setShowSessionModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const navigate = useNavigate();
    const userRef = useRef(user);
    useEffect(() => { userRef.current = user; }, [user]);

    const timers = useRef({
        warning: null,
        logout: null,
        idle: null,
    });

    const apiCall = {
        fetchMe: useCallback(() => api.get({ path: "/me/all" }), []),
        refresh: useCallback(() => api.post({ path: "/auth/refresh" }), []),
    };

    const logout = useCallback(async () => {
        try {
            await api.post({ path: "/auth/logout" });
        } catch {}

        localStorage.removeItem(HAS_SESSION_KEY);
        setUser(null);
        setShowSessionModal(false);
        navigate(PATH.login.build());
    }, [navigate]);

    const clearTimers = () => {
        Object.values(timers.current).forEach(clearTimeout);
    };

    const startSessionTimers = useCallback(() => {
        clearTimers();

        // warning modal
        timers.current.warning = setTimeout(() => {
            setShowSessionModal(true);
        }, WARNING_TIME);

        // logout real
        timers.current.logout = setTimeout(async () => {
            await logout();
        }, ABSOLUTE_EXPIRY);
    }, [logout]);

    const resetIdle = useCallback(() => {
        clearTimeout(timers.current.idle);

        timers.current.idle = setTimeout(() => {
            setShowSessionModal(true);
        }, IDLE_LIMIT);

        startSessionTimers();
    }, [startSessionTimers]);

    useEffect(() => {
        if (!user) return;

        // const events = ["mousemove", "keydown", "click", "scroll"];
        const events = ["keydown", "click", "scroll"];

        events.forEach((e) =>
            window.addEventListener(e, resetIdle, { passive: true })
        );

        resetIdle();

        return () => {
            events.forEach((e) =>
                window.removeEventListener(e, resetIdle)
            );
            clearTimers();
        };
    }, [user, resetIdle]);

    useEffect(() => {
        const init = async () => {
            if (!localStorage.getItem(HAS_SESSION_KEY)) {
                setLoading(false);
                return;
            }

            try {
                const me = await apiCall.fetchMe();
                setUser(me);
                startSessionTimers();
            } catch (err) {
                localStorage.removeItem(HAS_SESSION_KEY);

                if (isInvalidSession(err)) {
                    await logout();
                } else {
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logout, startSessionTimers]);

    const refreshUser = useCallback(async () => {
        if (!userRef.current) return;

        try {
            const me = await apiCall.fetchMe();

            if (JSON.stringify(me) !== JSON.stringify(userRef.current)) {
                setUser(me);
            }
        } catch (err) {
            if (isInvalidSession(err)) {
                await logout();
            } else {
                setError(err?.message || "Error al refrescar usuario");
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logout]);

    const login = async (formData) => {
        try {
            await api.post({
                path: "/auth/login",
                body: handleData(formData)
            });

            const me = await apiCall.fetchMe();
            setUser(me);

            localStorage.setItem(HAS_SESSION_KEY, "true");
            startSessionTimers();

            return { ok: true };
        } catch (err) {
            return { ok: false, error: err?.message };
        }
    };

    const register = async (formData) => {
        try {
            await api.post({
                path: "/auth/register",
                body: handleData(formData)
            });

            return { ok: true };
        } catch (err) {
            return { ok: false, error: err?.message };
        }
    };

    const keepSession = async () => {
        setModalLoading(true);

        try {
            await api.post({ path: "/auth/refresh" });
            await refreshUser();
            setShowSessionModal(false);
            startSessionTimers();
        } catch {
            await logout();
        } finally {
            setModalLoading(false);
        }
    };

    const forceLogout = async () => {
        await logout();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                refreshUser,
                loading,
                error,
                isAuthenticated: !!user,
            }}
        >
            {children}

            <Modal
                active={showSessionModal}
                title="Sesión por expirar"
                loading={modalLoading}
                confirmText="Seguir conectado"
                cancelText="Cerrar sesión"
                onConfirm={keepSession}
                onClose={forceLogout}
            >
                Tu sesión está inactiva o por expirar.  
                ¿Quieres mantenerla activa?
            </Modal>
        </AuthContext.Provider>
    );
};