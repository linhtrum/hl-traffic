import { useState, useEffect } from 'react';
import Modal from './Modal';
import { customerApi } from '../utils/axiosClient';

function AssignDeviceModal({ isOpen, onClose, onSubmit, error: propError, isSubmitting }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
        }
    }, [isOpen]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customerApi.getCustomers({
                pageSize: 100,
                page: 0,
                sortProperty: 'title',
                sortOrder: 'ASC'
            });
            setCustomers(response.data.data);
            setSelectedCustomer('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCustomer) {
            setError('Please select a customer');
            return;
        }
        onSubmit(selectedCustomer);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Device to Customer">
            <form onSubmit={handleSubmit} className="space-y-4">
                {(error || propError) && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                        {error || propError}
                    </div>
                )}
                <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                        Select Customer
                    </label>
                    <select
                        id="customer"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        disabled={loading}
                    >
                        <option value="">Select a customer...</option>
                        {customers.map((customer) => (
                            <option key={customer.id.id} value={customer.id.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? 'Assigning...' : 'Assign'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default AssignDeviceModal; 