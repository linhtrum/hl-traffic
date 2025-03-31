import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { customerApi } from '../utils/axiosClient';
import AddCustomerModal from '../components/AddCustomerModal';
import Modal from '../components/Modal';

function Customer() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const sortProperty = searchParams.get('sortProperty') || 'createdTime';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    useEffect(() => {
        fetchCustomers();
    }, [page, pageSize, sortProperty, sortOrder]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCustomers(customers);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = customers.filter(customer =>
            (customer.name?.toLowerCase() || '').includes(searchLower) ||
            (customer.email?.toLowerCase() || '').includes(searchLower) ||
            (customer.title?.toLowerCase() || '').includes(searchLower)
        );
        setFilteredCustomers(filtered);
    }, [searchTerm, customers]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customerApi.getCustomers({
                page,
                pageSize,
                sortProperty,
                sortOrder
            });
            setCustomers(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch customers');
            setCustomers([]);
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

    const handleAddCustomer = async (customerData) => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);
            await customerApi.createCustomer(customerData);
            setIsModalOpen(false);
            fetchCustomers();
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to create customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCustomer = async (customerData) => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);
            await customerApi.createCustomer({
                ...customerData,
                id: editingCustomer.id
            });
            setIsModalOpen(false);
            setEditingCustomer(null);
            fetchCustomers();
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to update customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            await customerApi.deleteCustomer(customerToDelete.id);
            setIsDeleteModalOpen(false);
            setCustomerToDelete(null);
            fetchCustomers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete customer');
        }
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const openDeleteModal = (customer) => {
        setCustomerToDelete(customer);
        setIsDeleteModalOpen(true);
    };

    const handleRowClick = (customer) => {
        navigate(`/customers/${customer.id.id}/users`);
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
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your customers</p>
            </header>
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search customers..."
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
                            setEditingCustomer(null);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Customer
                    </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                    onClick={() => handleSort('name')}
                                >
                                    Title
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                    onClick={() => handleSort('email')}
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Location
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
                            {filteredCustomers.map((customer) => (
                                <tr
                                    key={customer.id.id}
                                    onClick={() => handleRowClick(customer)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{customer.title}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">{customer.email}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {new Date(customer.createdTime).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(customer) }}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCustomerToDelete(customer); setIsDeleteModalOpen(true) }}
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
                    <div className="flex items-center">
                        <button
                            onClick={() => setSearchParams({ page: (page - 1).toString(), sortProperty, sortOrder })}
                            disabled={page === 1}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="mx-4 text-sm text-gray-700">
                            Page {page}
                        </span>
                        <button
                            onClick={() => setSearchParams({ page: (page + 1).toString(), sortProperty, sortOrder })}
                            disabled={customers.length < 10}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
                <AddCustomerModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingCustomer(null);
                    }}
                    onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer}
                    error={submitError}
                    isSubmitting={isSubmitting}
                    initialData={editingCustomer}
                    isEditing={!!editingCustomer}
                />
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setCustomerToDelete(null);
                    }}
                    title="Delete Customer"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete this customer? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setCustomerToDelete(null);
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await customerApi.deleteCustomer(customerToDelete.id);
                                        setIsDeleteModalOpen(false);
                                        setCustomerToDelete(null);
                                        fetchCustomers();
                                    } catch (err) {
                                        setError(err.response?.data?.message || 'Failed to delete customer');
                                    }
                                }}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default Customer; 