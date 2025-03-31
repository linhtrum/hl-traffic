import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { customerApi } from '../utils/axiosClient';
import UserModal from '../components/UserModal';
import SetPasswordModal from '../components/SetPasswordModal';
import Modal from '../components/Modal';
import { useAuthContext } from '../context/AuthContext';

function CustomerUsers() {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [isSettingPassword, setIsSettingPassword] = useState(false);
    const timeoutRef = useRef(null);

    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const sortProperty = searchParams.get('sortProperty') || 'createdTime';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [page, pageSize, sortProperty, sortOrder]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = users.filter(user =>
            (user.email?.toLowerCase() || '').includes(searchLower) ||
            (user.name?.toLowerCase() || '').includes(searchLower)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customerApi.getCustomerUsers(customerId, {
                page,
                pageSize,
                sortProperty,
                sortOrder,
                textSearch: searchTerm
            });
            setUsers(response.data.data || []);
            setTotalElements(response.data.totalElements);
            setHasNext(response.data.hasNext);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '0');
            return newParams;
        });
    };

    const handleSort = (field) => {
        const newOrder = sortProperty === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
        setSearchParams({ page: '0', pageSize: '10', sortProperty: field, sortOrder: newOrder });
    };

    const handlePaginationChange = (newPage) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', newPage.toString());
            return newParams;
        });
    };

    const handleAddUser = async (userData) => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);
            await customerApi.createUser(userData);
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUser = async (userData) => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);
            await customerApi.updateUser(userData);
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            await customerApi.deleteUser(userToDelete.id.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSetPassword = async (user) => {
        try {
            setIsSettingPassword(true);
            setPasswordError(null);
            const response = await customerApi.getUserActivationLink(user.id.id);

            // Parse the activation token from the URL
            const url = new URL(response.data.value);
            const activateToken = url.searchParams.get('activateToken');

            if (!activateToken) {
                throw new Error('Invalid activation link');
            }

            setSelectedUser({
                ...user,
                activateToken,
                ttlMs: response.data.ttlMs
            });
            setIsPasswordModalOpen(true);
        } catch (err) {
            // Handle server error response
            if (err.response?.data) {
                setPasswordError(err.response.data.message || 'Failed to get activation link');
            } else {
                setPasswordError('Failed to get activation link');
            }
            setIsPasswordModalOpen(false);
            setSelectedUser(null);
            timeoutRef.current = setTimeout(() => {
                setPasswordError(null);
            }, 3000);
        } finally {
            setIsSettingPassword(false);
        }
    };

    const handlePasswordSubmit = async (password) => {
        try {
            setIsSettingPassword(true);
            setPasswordError(null);
            await customerApi.activateUser(selectedUser.activateToken, password);
            setIsPasswordModalOpen(false);
            setSelectedUser(null);
            setSuccessMessage('Password set successfully');
            // Clear success message after 3 seconds
            timeoutRef.current = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to set password');
        } finally {
            setIsSettingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto px-6 py-2 mb-[48px]">
            {successMessage && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-600">
                    {successMessage}
                </div>
            )}
            {
                passwordError && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
                        {passwordError}
                    </div>
                )
            }
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Users</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage users for this customer</p>
                    </div>
                    <button
                        onClick={() => navigate('/customers')}
                        className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Customers
                    </button>
                </div>
            </header>

            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                    onClick={() => handleSort('email')}
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                    onClick={() => handleSort('firstName')}
                                >
                                    Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                    onClick={() => handleSort('authority')}
                                >
                                    Authority
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                    onClick={() => handleSort('createdTime')}
                                >
                                    Created
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredUsers.map((user) => (
                                <tr key={user.id.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">{user.authority}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {new Date(user.createdTime).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleSetPassword(user)}
                                            className="text-green-600 hover:text-green-900 mr-4"
                                        >
                                            Set Password
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUserToDelete(user);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePaginationChange(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePaginationChange(page + 1)}
                            disabled={!hasNext}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                onSubmit={editingUser ? handleEditUser : handleAddUser}
                error={submitError}
                isSubmitting={isSubmitting}
                initialData={editingUser}
                isEditing={!!editingUser}
                customerId={customerId}
                tenantId={user?.tenantId}
            />

            <SetPasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handlePasswordSubmit}
                error={passwordError}
                isSubmitting={isSettingPassword}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                }}
                title="Delete User"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setUserToDelete(null);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default CustomerUsers; 