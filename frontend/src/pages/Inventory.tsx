import { useEffect, useState } from 'react';
import api from '../api/axios';
// Version: 2025-11-25-fix

interface InventoryItem {
    id: number;
    productId: number;
    quantity: number;
    location: string;
    product?: {
        name: string;
        price: number;
    };
}

interface Product {
    id: number;
    name: string;
}

export default function Inventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        reason: 'Stock inicial'
    });

    useEffect(() => {
        loadInventory();
        loadProducts();
    }, []);

    const loadInventory = async () => {
        try {
            const response = await api.get('/inventory');
            setInventory(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading inventory:', error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        }
    };

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/inventory', {
                productId: Number(formData.productId),
                type: 'IN',
                quantity: Number(formData.quantity),
                reason: formData.reason
            });
            setIsModalOpen(false);
            setFormData({ productId: '', quantity: '', reason: 'Stock inicial' });
            loadInventory();
        } catch (error) {
            console.error('Error adding stock:', error);
            alert('Error al agregar stock');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando inventario...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                >
                    + Agregar Stock
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left">Producto</th>
                            <th className="px-6 py-4 text-left">Cantidad</th>
                            <th className="px-6 py-4 text-left">Ubicación</th>
                            <th className="px-6 py-4 text-left">Valor Total</th>
                            <th className="px-6 py-4 text-left">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {inventory.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No hay items en el inventario
                                </td>
                            </tr>
                        ) : (
                            inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        {item.product?.name || `Producto #${item.productId}`}
                                    </td>
                                    <td className="px-6 py-4">{item.quantity}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.location}</td>
                                    <td className="px-6 py-4 font-semibold text-green-600">
                                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.quantity > 20
                                            ? 'bg-green-100 text-green-700'
                                            : item.quantity > 5
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {item.quantity > 20 ? 'Stock Alto' : item.quantity > 5 ? 'Stock Medio' : 'Stock Bajo'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Agregar Stock</h2>
                        <form onSubmit={handleAddStock} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                >
                                    <option value="">Seleccione un producto...</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a Agregar</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Razón / Nota</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
