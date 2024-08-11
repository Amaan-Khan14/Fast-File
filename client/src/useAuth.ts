import { useState, useEffect } from 'react';
import axios from 'axios';
import { APP_URL } from '@/config';

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkLoginStatus = async () => {
        try {
            await axios.get(`${APP_URL}/user/me`, {
                withCredentials: true
            });
            setIsLoggedIn(true);
            return true;
        } catch (error) {
            setIsLoggedIn(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    return { isLoggedIn, isLoading, setIsLoading, checkLoginStatus, setIsLoggedIn };
}