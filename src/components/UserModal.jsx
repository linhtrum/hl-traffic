import { useState, useEffect } from 'react';
import Modal from './Modal';

function UserModal({ isOpen, onClose, onSubmit, error, isSubmitting, initialData, isEditing, customerId, tenantId }) {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        additionalInfo: {
            description: '',
            defaultDashboardId: null,
            defaultDashboardFullscreen: false,
            homeDashboardId: null,
            homeDashboardHideToolbar: true
        }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                additionalInfo: initialData.additionalInfo || {
                    description: '',
                    defaultDashboardId: null,
                    defaultDashboardFullscreen: false,
                    homeDashboardId: null,
                    homeDashboardHideToolbar: true
                }
            });
        } else {
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                phone: '',
                additionalInfo: {
                    description: '',
                    defaultDashboardId: null,
                    defaultDashboardFullscreen: false,
                    homeDashboardId: null,
                    homeDashboardHideToolbar: true
                }
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = isEditing
            ? {
                ...formData,
                id: initialData.id,
                version: initialData.version,
                authority: 'CUSTOMER_USER',
                tenantId: {
                    entityType: 'TENANT',
                    id: tenantId
                },
                customerId: {
                    entityType: 'CUSTOMER',
                    id: customerId
                }
            }
            : {
                ...formData,
                authority: 'CUSTOMER_USER',
                tenantId: {
                    entityType: 'TENANT',
                    id: tenantId
                },
                customerId: {
                    entityType: 'CUSTOMER',
                    id: customerId
                }
            };
        onSubmit(userData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit User' : 'Add New User'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.additionalInfo.description}
                        onChange={(e) => setFormData({
                            ...formData,
                            additionalInfo: { ...formData.additionalInfo, description: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={3}
                    />
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    >
                        {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default UserModal; 