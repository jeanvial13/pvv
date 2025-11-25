import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../api/axios';

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

interface User {
    id: number;
    email: string;
    name: string;
    roleId: number;
    role: Role;
    createdAt: string;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        roleId: 2,
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/auth/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingUser) {
                // Update user
                const updateData: any = {
                    name: formData.name,
                    roleId: formData.roleId,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await api.put(`/auth/users/${editingUser.id}`, updateData);
            } else {
                // Create user
                await api.post('/auth/users', formData);
            }

            fetchUsers();
            closeModal();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            await api.delete(`/auth/users/${userId}`);
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            password: '',
            name: '',
            roleId: 2,
        });
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '',
            name: user.name,
            roleId: user.roleId,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            email: '',
            password: '',
            name: '',
            roleId: 2,
        });
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName) {
            case 'ADMIN': return 'bg-red-500/20 text-red-300 border-red-500';
            case 'SUPERVISOR': return 'bg-purple-500/20 text-purple-300 border-purple-500';
            case 'CASHIER': return 'bg-blue-500/20 text-blue-300 border-blue-500';
            case 'INVENTORY': return 'bg-green-500/20 text-green-300 border-green-500';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500';
        }
    };

    if (loading) {
        return <div className="p-6">Cargando...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UsersIcon className="w-8 h-8" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-gray-400 mt-1">Administrar usuarios del sistema</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha Creación</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-700/30">
                                <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                                <td className="px-6 py-4 text-sm text-white">{user.name}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role.name)}`}>
                                        {user.role.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-right">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="text-blue-400 hover:text-blue-300 mr-3"
                                    >
                                        <Edit2 className="w-4 h-4 inline" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="w-4 h-4 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold mb-4">
                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="victor"
                                    required
                                    disabled={!!editingUser}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={!editingUser}
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Rol
                                </label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                                >
                                    {editingUser ? 'Actualizar' : 'Crear Usuario'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
