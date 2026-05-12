import React, { createContext, useState, useContext, useEffect } from 'react';

export const UserDataContext = createContext<any>(null);

export const UserContext = ({ children }: { children: React.ReactNode }) => {
    const [ user, setUser ] = useState<any>(null);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, verify token with API
            // For now, assume it's valid if present
            const savedUser = localStorage.getItem('user');
            if (savedUser && savedUser !== 'undefined') {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                }
            }
        }
        setIsLoading(false);
    }, []);

    return (
        <UserDataContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </UserDataContext.Provider>
    );
};
