import { useEffect, useState } from 'react';
import api from '../api/axios';
// Version: 2025-11-25-fix

interface Repair {
    id: number;
    deviceType: string;
    brand: string;
    model: string;
    issue: string;
    status: string;
    estimatedCost: number;
    client?: { name: string };
}

interface Client {
    id: number;
    name: string;
}

export default function Repairs() {
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Client, 2: Device, 3: Repair

    // Form Data
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [deviceData, setDeviceData] = useState({
        brand: '',
        model: '',
        imei: '',
        condition: '',
        color: '',
        accessories: ''
    });
    const [repairData, setRepairData] = useState({
        reportedIssue: '',
        estimatedCost: '',
        estimatedDelivery: '',
        warranty: ''
    });

    useEffect(() => {
        loadRepairs();
        loadClients();
    }, []);

    const loadRepairs = async () => {
        try {
            const response = await api.get('/repairs');
            setRepairs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading repairs:', error);
            setRepairs([]);
        } finally {
            setLoading(false);
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

    const handleCreateRepair = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create Device
            const deviceResponse = await api.post('/devices', {
                clientId: Number(selectedClientId),
                ...deviceData
            });
            const deviceId = deviceResponse.data.id;

            // 2. Create Repair
            const repairPayload: any = {
                clientId: Number(selectedClientId),
                deviceId: deviceId,
                reportedIssue: repairData.reportedIssue,
                estimatedCost: parseFloat(repairData.estimatedCost)
            };

            // Only include optional fields if provided
            if (repairData.estimatedDelivery) {
                repairPayload.estimatedDelivery = repairData.estimatedDelivery;
            }
            if (repairData.warranty) {
                repairPayload.warranty = repairData.warranty;
            }

            await api.post('/repairs', repairPayload);

            setIsModalOpen(false);
            resetForm();
            loadRepairs();
        } catch (error) {
            console.error('Error creating repair:', error);
            alert('Error al crear la reparación');
        }
    };

    const resetForm = () => {
        setStep(1);
        setSelectedClientId('');
        setDeviceData({ brand: '', model: '', imei: '', condition: '', color: '', accessories: '' });
        setRepairData({ reportedIssue: '', estimatedCost: '', estimatedDelivery: '', warranty: '' });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'in_progress':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'delivered':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando reparaciones...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Reparaciones</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                >
                    + Nueva Reparación
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {repairs.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No hay reparaciones registradas
                    </div>
                ) : (
                    repairs.map((repair) => (
                        <div
                            key={repair.id}
                            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {repair.brand} {repair.model}
                                    </h3>
                                    <p className="text-sm text-gray-500">{repair.deviceType}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(repair.status)}`}>
                                    {repair.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Cliente:</span> {repair.client?.name || 'N/A'}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Problema:</span> {repair.issue}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Costo estimado:</span>{' '}
                                    <span className="text-green-600 font-bold">${repair.estimatedCost.toFixed(2)}</span>
                                </p>
                            </div>

                            <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                Ver detalles
                            </button>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            Nueva Reparación - Paso {step}/3
                        </h2>

                        <form onSubmit={handleCreateRepair}>
                            {/* Step 1: Client Selection */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Cliente</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={selectedClientId}
                                            onChange={(e) => setSelectedClientId(Number(e.target.value))}
                                        >
                                            <option value="">Seleccione un cliente...</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!selectedClientId}
                                            onClick={() => setStep(2)}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Device Details */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                value={deviceData.brand}
                                                onChange={(e) => setDeviceData({ ...deviceData, brand: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                value={deviceData.model}
                                                onChange={(e) => setDeviceData({ ...deviceData, model: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">IMEI / Serie</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={deviceData.imei}
                                            onChange={(e) => setDeviceData({ ...deviceData, imei: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Condición</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                value={deviceData.condition}
                                                onChange={(e) => setDeviceData({ ...deviceData, condition: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                value={deviceData.color}
                                                onChange={(e) => setDeviceData({ ...deviceData, color: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Accesorios</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={deviceData.accessories}
                                            onChange={(e) => setDeviceData({ ...deviceData, accessories: e.target.value })}
                                            placeholder="Cargador, Funda, etc."
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(3)}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Repair Details */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Problema Reportado</label>
                                        <textarea
                                            required
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24"
                                            value={repairData.reportedIssue}
                                            onChange={(e) => setRepairData({ ...repairData, reportedIssue: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                value={repairData.estimatedCost}
                                                onChange={(e) => setRepairData({ ...repairData, estimatedCost: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrega Est.</label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                value={repairData.estimatedDelivery}
                                                onChange={(e) => setRepairData({ ...repairData, estimatedDelivery: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Garantía</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={repairData.warranty}
                                            onChange={(e) => setRepairData({ ...repairData, warranty: e.target.value })}
                                            placeholder="Ej: 30 días"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                        >
                                            Crear Reparación
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
