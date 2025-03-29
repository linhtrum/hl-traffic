import Modal from './Modal';
import { useState, useEffect } from 'react';

function AddPlanModal({ isOpen, onClose, onSubmit, planNumber, initialData }) {
    const [formData, setFormData] = useState({
        hour: 0,
        minute: 0,
        programNumber: 1,
        enabled: true
    });

    // Update formData when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                hour: initialData.hour || 0,
                minute: initialData.minute || 0,
                programNumber: initialData.programNumber || 1,
                enabled: initialData.enabled ?? true
            });
        } else {
            // Reset to default values when initialData is undefined
            setFormData({
                hour: 0,
                minute: 0,
                programNumber: 1,
                enabled: true
            });
        }
    }, [planNumber, initialData]);

    // console.log(formData);

    const handleSubmit = (e) => {
        e.preventDefault();
        const planData = {
            [`P${planNumber}_HH`]: parseInt(formData.hour),
            [`P${planNumber}_mm`]: parseInt(formData.minute),
            [`P${planNumber}_Pr`]: parseInt(formData.programNumber),
            [`P${planNumber}_ENT`]: formData.enabled ? 1 : 0
        };
        onSubmit(planData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Plan ${planNumber}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hour</label>
                        <div className="mt-1">
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={formData.hour}
                                onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                required
                                placeholder="Enter hour (0-23)"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Minute</label>
                        <div className="mt-1">
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={formData.minute}
                                onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                required
                                placeholder="Enter minute (0-59)"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Program Number</label>
                        <div className="mt-1">
                            <input
                                type="number"
                                min="1"
                                max="6"
                                value={formData.programNumber}
                                onChange={(e) => setFormData({ ...formData, programNumber: e.target.value })}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                required
                                placeholder="Enter program number (1-6)"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Enable Plan
                        </label>
                    </div>
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
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        Save Plan
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default AddPlanModal; 