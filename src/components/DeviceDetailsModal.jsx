import Modal from './Modal';

function DeviceDetailsModal({ isOpen, onClose, device, onEdit }) {
    if (!device) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Device Details">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Device ID</label>
                    <p className="mt-1 text-sm text-gray-900">{device.id.id}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{device.name}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{device.type}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Label</label>
                    <p className="mt-1 text-sm text-gray-900">{device.label}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">{device.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Created Time</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(device.createdTime).toLocaleString()}</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Close
                </button>
                <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                    Edit Device
                </button>
            </div>
        </Modal>
    );
}

export default DeviceDetailsModal; 