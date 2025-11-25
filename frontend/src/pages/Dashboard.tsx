import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Stats {
    totalSales: number;
    totalProducts: number;
    totalClients: number;
    totalRepairs: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalSales: 0,
        totalProducts: 0,
        totalClients: 0,
        totalRepairs: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Load stats from different endpoints
            const [sales, products, clients, repairs] = await Promise.all([
                api.get('/sales').catch(() => ({ data: [] })),
                api.get('/products').catch(() => ({ data: [] })),
                api.get('/clients').catch(() => ({ data: [] })),
                api.get('/repairs').catch(() => ({ data: [] })),
            ]);

            setStats({
                totalSales: sales.data.length || 0,
                totalProducts: products.data.length || 0,
                totalClients: clients.data.length || 0,
                totalRepairs: repairs.data.length || 0,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Ventas', value: stats.totalSales, icon: '💰', color: 'from-green-500 to-emerald-600' },
        { title: 'Productos', value: stats.totalProducts, icon: '📦', color: 'from-blue-500 to-cyan-600' },
        { title: 'Clientes', value: stats.totalClients, icon: '👥', color: 'from-purple-500 to-pink-600' },
        { title: 'Reparaciones', value: stats.totalRepairs, icon: '🔧', color: 'from-orange-500 to-red-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl text-gray-600">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mt-1">Bienvenido al sistema VICMAN</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
                    >
                        <div className={`bg-gradient-to-r ${card.color} p-6`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm font-medium">{card.title}</p>
                                    <p className="text-white text-3xl font-bold mt-2">{card.value}</p>
                                </div>
                                <div className="text-5xl opacity-80">{card.icon}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
                <div className="text-gray-600">
                    <p>No hay actividad reciente para mostrar.</p>
                </div>
            </div>
        </div>
    );
}
