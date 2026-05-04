import { useEffect, useState } from 'react';

import { DashApi } from '../api/dash-api';

export const useInternet状态 = () => {
    const [internet状态, setInternet状态] = useState<'online' | 'offline' | 'checking'>('checking');

    const checkInternetConnectivity = async () => {
        try {
            setInternet状态('checking');
            const status = await DashApi.checkInternetConnectivity();
            setInternet状态(status);
        } catch (error) {
            console.error('Error checking internet connectivity:', error);
            setInternet状态('offline');
        }
    };

    useEffect(() => {
        // Initial check
        checkInternetConnectivity();

        // Check every 2 minutes
        const internetCheckInterval = setInterval(() => {
            checkInternetConnectivity();
        }, 120000); // 120000 ms = 2 minutes

        return () => {
            clearInterval(internetCheckInterval);
        };
    }, []);

    return { internet状态, checkInternetConnectivity };
};
