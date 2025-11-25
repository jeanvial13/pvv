import { useEffect, useState } from 'react';
import api from '../api/axios';
// Version: 2025-11-25-fix

interface Sale {
    id: number;
    total: number;
    createdAt: string;
    client?: { name: string };
}

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

interface Client {
    id: number;
    name: string;
}

interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    total: number;
}

export default function Sales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sale Form State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    // Add Item State
    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadSales();
        loadProducts();
        loadClients();
    }, []);

    const loadSales = async () => {
        try {
            const response = await api.get('/sales');
            setSales(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading sales:', error);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const loadClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleAddItem = () => {
        if (!selectedProductId) return;

        const product = products.find(p => p.id === Number(selectedProductId));
        if (!product) return;

        if (product.stock < quantity) {
            alert('No hay suficiente stock');
            return;
        }

        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: quantity,
                total: quantity * Number(product.price)
            }]);
        }

        setSelectedProductId('');
        setQuantity(1);
    };

    const handleRemoveItem = (productId: number) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.total, 0);
    };

    const handleCreateSale = async () => {
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        try {
            await api.post('/sales', {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                })),
                clientId: selectedClientId ? Number(selectedClientId) : undefined,
                paymentMethod,
                discount: 0
            });

            setIsModalOpen(false);
            setCart([]);
            setSelectedClientId('');
            setPaymentMethod('CASH');
            loadSales();
            loadProducts(); // Reload to update stock
        } catch (error) {
            console.error('Error creating sale:', error);
            alert('Error al crear la venta');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando ventas...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Ventas</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                    + Nueva Venta
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left">ID</th>
                            <th className="px-6 py-4 text-left">Cliente</th>
                            <th className="px-6 py-4 text-left">Total</th>
                            <th className="px-6 py-4 text-left">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No hay ventas registradas
                                </td>
                            </tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">#{sale.id}</td>
                                    <td className="px-6 py-4 text-gray-600">{sale.client?.name || 'Cliente General'}</td>
                                    <td className="px-6 py-4 font-bold text-green-600">
                                        ${Number(sale.total).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(sale.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Nueva Venta</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Add Items */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="font-semibold mb-4 text-gray-700">Agregar Producto</h3>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <select
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={selectedProductId}
                                                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                                            >
                                                <option value="">Seleccione un producto...</option>
                                                {products.map(product => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} - ${Number(product.price).toFixed(2)} (Stock: {product.stock})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddItem}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Producto</th>
                                                <th className="px-4 py-2 text-center">Cant.</th>
                                                <th className="px-4 py-2 text-right">Precio</th>
                                                <th className="px-4 py-2 text-right">Total</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map(item => (
                                                <tr key={item.productId} className="border-t">
                                                    <td className="px-4 py-2">{item.name}</td>
                                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-right font-semibold">${item.total.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.productId)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {cart.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                        Carrito vacío
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right Column: Checkout */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-full flex flex-col">
                                    <h3 className="font-semibold mb-4 text-gray-700">Resumen de Venta</h3>

                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                            <select
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={selectedClientId}
                                                onChange={(e) => setSelectedClientId(Number(e.target.value))}
                                            >
                                                <option value="">Cliente General</option>
                                                {clients.map(client => (
                                                    <option key={client.id} value={client.id}>{client.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                            <select
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            >
                                                <option value="CASH">Efectivo</option>
                                                <option value="CARD">Tarjeta</option>
                                                <option value="TRANSFER">Transferencia</option>
                                            </select>
                                        </div>

                                        <div className="border-t pt-4 mt-4">
                                            <div className="flex justify-between items-center text-xl font-bold">
                                                <span>Total:</span>
                                                <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={handleCreateSale}
                                            disabled={cart.length === 0}
                                            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            Completar Venta
                                        </button>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-full py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
