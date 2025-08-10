import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const AuthApi = createContext();

const AuthProvider = ({ children }) => {
    
    const [auth, setAuth] = useState(() => {
        return localStorage.getItem('authToken') !== null;
    });

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setAuth(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuth(false);
        toast.warning("Your token has expired. You have been logged out.", {
            autoClose: 3000, 
        });
    };
    

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                const isTokenExpired = checkTokenExpiration(token);
                if (isTokenExpired) {
                    logout(); 
                }
            }
        };

        const interval = setInterval(checkToken, 60000); 
        return () => clearInterval(interval);
    }, []);

 

    const checkTokenExpiration = (token) => {
        // Aquí puedes implementar la lógica para verificar la expiración del token
        // Por ejemplo, decodificando el token JWT y verificando la fecha de expiración
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el payload del JWT
        const expirationTime = payload.exp * 1000; // Convierte a milisegundos
        return Date.now() >= expirationTime; // Verifica si el token ha expirado
    };
     
    return (
        <AuthApi.Provider value={{ auth, login, logout }}>
            {children}
        </AuthApi.Provider>
    );
};

export default AuthProvider; 
export const useAuth = () => useContext(AuthApi);