"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isSignedIn: boolean;
    setIsSignedIn: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isSignedIn, setIsSignedIn] = useState(false);

    // Load authentication state from localStorage on mount
    useEffect(() => {
        const savedAuthState = localStorage.getItem('isSignedIn');
        if (savedAuthState === 'true') {
            setIsSignedIn(true);
        }
    }, []);

    // Persist authentication state to localStorage when it changes
    useEffect(() => {
        if (isSignedIn) {
            localStorage.setItem('isSignedIn', 'true');
        } else {
            localStorage.removeItem('isSignedIn');
        }
    }, [isSignedIn]);

    return (
        <AuthContext.Provider value={{ isSignedIn, setIsSignedIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
