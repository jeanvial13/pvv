import { create } from 'zustand';
import api from '../api/axios';

interface User {
    id: number;
    username: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (username: string, password: string) => {
        try {
            console.log('🔐 Attempting login for:', username);

            const response = await api.post('/auth/login', {
                email: username,
                password
            });

            const { access_token, user } = response.data;

            console.log('✅ Login successful!');
            localStorage.setItem('token', access_token);
            set({ token: access_token, user, isAuthenticated: true });

        } catch (error: any) {
            console.error('❌ Login error:', error);

            // Detailed error message
            let errorMessage = 'Error al iniciar sesión';

            if (error.response) {
                // Server responded with error
                errorMessage = error.response?.data?.message ||
                    `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                // Request made but no response
                errorMessage = 'No se pudo conectar con el servidor. Verifique que el backend esté corriendo.';
            } else {
                // Something else happened
                errorMessage = error.message || 'Error desconocido';
            }

            throw new Error(errorMessage);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        set({ isAuthenticated: !!token });
    },
}));
