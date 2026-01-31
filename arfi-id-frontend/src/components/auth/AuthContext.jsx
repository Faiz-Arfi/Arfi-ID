import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../../service/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await authService.getMe();
                setUser(response);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        verifyUser();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        setUser(response);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);