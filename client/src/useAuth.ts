import { useState, useEffect } from 'react';
import axios from 'axios';
import { APP_URL } from '@/config';

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; username: string }>();

    const checkLoginStatus = async () => {
        try {
            const response = await axios.get(`${APP_URL}/user/me`, {
                withCredentials: true
            });
            setIsLoggedIn(true);
            setUser(response.data);
            return true;
        } catch (error) {
            setIsLoggedIn(false);
            setUser(undefined);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    return {
        isLoggedIn,
        isLoading,
        setIsLoading,
        checkLoginStatus,
        setIsLoggedIn,
        user
    };
}