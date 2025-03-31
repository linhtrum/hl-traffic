import { useState, useEffect } from 'react';
import Modal from './Modal';

function AddCustomerModal({ isOpen, onClose, onSubmit, error, isSubmitting, initialData, isEditing }) {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        email: '',
        phone: '',
        country: '',
        state: '',
        city: '',
        address: '',
        address2: '',
        zip: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                country: initialData.country || '',
                state: initialData.state || '',
                city: initialData.city || '',
                address: initialData.address || '',
                address2: initialData.address2 || '',
                zip: initialData.zip || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Customer" : "Add New Customer"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Title<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                            placeholder="Enter title"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter email address"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter phone number"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter country"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter state"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter city"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                            type="text"
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter ZIP code"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter address"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address 2</label>
                        <input
                            type="text"
                            name="address2"
                            value={formData.address2}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter additional address"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                {isEditing ? "Updating..." : "Creating..."}
                            </div>
                        ) : (
                            isEditing ? "Update Customer" : "Create Customer"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default AddCustomerModal; 