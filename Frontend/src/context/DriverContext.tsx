import React, { createContext, useState, useContext, useEffect } from 'react';

export const DriverDataContext = createContext<any>(null);

export const DriverContext = ({ children }: { children: React.ReactNode }) => {
    const [ driver, setDriver ] = useState<any>(null);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('driver-token');
        if (token) {
            const savedDriver = localStorage.getItem('driver');
            if (savedDriver && savedDriver !== 'undefined') {
                try {
                    setDriver(JSON.parse(savedDriver));
                } catch (e) {
                    console.error("Failed to parse driver from localStorage", e);
                }
            }
        }
        setIsLoading(false);
    }, []);

    return (
        <DriverDataContext.Provider value={{ driver, setDriver, isLoading }}>
            {children}
        </DriverDataContext.Provider>
    );
};
