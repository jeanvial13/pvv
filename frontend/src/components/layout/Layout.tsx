import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/sales', label: 'Ventas', icon: '💰' },
        { path: '/products', label: 'Productos', icon: '📦' },
        { path: '/clients', label: 'Clientes', icon: '👥' },
        { path: '/repairs', label: 'Reparaciones', icon: '🔧' },
        { path: '/inventory', label: 'Inventario', icon: '📋' },
        { path: '/users', label: 'Usuarios', icon: '👤' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-purple-900 text-white shadow-2xl z-10">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold">VICMAN</h1>
                    <p className="text-sm text-blue-200 mt-1">Sistema POS</p>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path
                                ? 'bg-white/20 shadow-lg'
                                : 'hover:bg-white/10'
                                }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <div className="mb-3 px-4">
                        <p className="text-sm text-blue-200">Usuario</p>
                        <p className="font-semibold">{user?.username || 'Admin'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                        <span>🚪</span>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
