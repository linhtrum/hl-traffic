import { useState, useEffect } from 'react';
import Modal from './Modal';

function SetLocationModal({ isOpen, onClose, onSubmit, initialLocation }) {
    const [location, setLocation] = useState({
        latitude: '',
        longitude: ''
    });

    // Update location state when initialLocation changes
    useEffect(() => {
        if (initialLocation) {
            setLocation({
                latitude: initialLocation.latitude.toString(),
                longitude: initialLocation.longitude.toString()
            });
        }
    }, [initialLocation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert to double precision
        const doubleLocation = {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude)
        };
        onSubmit(doubleLocation);
        onClose();
    };

    const handleInputChange = (e, field) => {
        const value = e.target.value;
        // Allow decimal points and negative signs
        if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
            setLocation(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set Device Location">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                        type="text"
                        value={location.latitude}
                        onChange={(e) => handleInputChange(e, 'latitude')}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                        placeholder="Enter latitude (e.g., 10.762622)"
                        pattern="^-?\d*\.?\d*$"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter value between -90 and 90</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                        type="text"
                        value={location.longitude}
                        onChange={(e) => handleInputChange(e, 'longitude')}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                        placeholder="Enter longitude (e.g., 106.660172)"
                        pattern="^-?\d*\.?\d*$"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter value between -180 and 180</p>
                </div>
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
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        Save Location
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default SetLocationModal; 