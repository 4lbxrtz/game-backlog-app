import { createContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of your User
interface User {
    id: number;
    username: string;
    email: string;
}

// Define what the Context provides to the app
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    loginAction: (token: string, user: User) => void;
    logoutAction: () => void;
}

// Create the Context
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On app start (or refresh), check storage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user", error);
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    // Function to handle Login (called by Login/Register views)
    const loginAction = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Function to handle Logout
    const logoutAction = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            loading, 
            loginAction, 
            logoutAction 
        }}>
            {children}
        </AuthContext.Provider>
    );
}