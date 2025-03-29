import Modal from './Modal';
import { useState, useEffect } from 'react';

function AddProgramModal({ isOpen, onClose, onSubmit, programNumber, initialData }) {
    const [formData, setFormData] = useState({
        greenPhase1: 0,
        greenPhase2: 0,
        greenPhase3: 0,
        startPhase1: 0,
        startPhase2: 0,
        startPhase3: 0,
        totalPeriod: 0
    });

    // Update formData when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                greenPhase1: initialData.greenPhase1 || 0,
                greenPhase2: initialData.greenPhase2 || 0,
                greenPhase3: initialData.greenPhase3 || 0,
                startPhase1: initialData.startPhase1 || 0,
                startPhase2: initialData.startPhase2 || 0,
                startPhase3: initialData.startPhase3 || 0,
                totalPeriod: initialData.totalPeriod || 0
            });
        } else {
            // Reset to default values when initialData is undefined
            setFormData({
                greenPhase1: 0,
                greenPhase2: 0,
                greenPhase3: 0,
                startPhase1: 0,
                startPhase2: 0,
                startPhase3: 0,
                totalPeriod: 0
            });
        }
    }, [programNumber, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const programData = {
            [`Pr${programNumber}_X1`]: parseInt(formData.greenPhase1),
            [`Pr${programNumber}_X2`]: parseInt(formData.greenPhase2),
            [`Pr${programNumber}_X3`]: parseInt(formData.greenPhase3),
            [`Start_Pr${programNumber}_X1`]: parseInt(formData.startPhase1),
            [`Start_Pr${programNumber}_X2`]: parseInt(formData.startPhase2),
            [`Start_Pr${programNumber}_X3`]: parseInt(formData.startPhase3)
        };
        onSubmit(programData);
    };

    const renderPhaseInputs = (phaseNumber) => (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Green Phase {phaseNumber}</label>
                <div className="mt-1">
                    <input
                        type="number"
                        min="0"
                        max="999"
                        value={formData[`greenPhase${phaseNumber}`]}
                        onChange={(e) => setFormData({ ...formData, [`greenPhase${phaseNumber}`]: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                        placeholder={`Enter green phase ${phaseNumber} (0-999)`}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Start Phase {phaseNumber}</label>
                <div className="mt-1">
                    <input
                        type="number"
                        min="0"
                        max="999"
                        value={formData[`startPhase${phaseNumber}`]}
                        onChange={(e) => setFormData({ ...formData, [`startPhase${phaseNumber}`]: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                        placeholder={`Enter start phase ${phaseNumber} (0-999)`}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Program ${programNumber}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Total Period (seconds)</label>
                    <div className="mt-1">
                        <input
                            type="number"
                            value={formData.totalPeriod}
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                            readOnly
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {[1, 2, 3].map(phaseNumber => (
                        <div key={phaseNumber} className="rounded-lg bg-gray-50 p-4">
                            <h3 className="mb-4 text-base font-medium text-gray-900">Phase {phaseNumber}</h3>
                            {renderPhaseInputs(phaseNumber)}
                        </div>
                    ))}
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
                        Save Program
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default AddProgramModal; 