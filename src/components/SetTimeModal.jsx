import Modal from './Modal';
import { useState, useEffect } from 'react';

function SetTimeModal({ isOpen, onClose, onSubmit, deviceTime }) {
    const [time, setTime] = useState({
        Day: '',
        Month: '',
        Year: '',
        Hour: '',
        Minute: '',
        Second: ''
    });

    useEffect(() => {
        if (deviceTime) {
            setTime({
                Day: deviceTime.Day || '',
                Month: deviceTime.Month || '',
                Year: deviceTime.Year || '',
                Hour: deviceTime.Hour || '',
                Minute: deviceTime.Minute || '',
                Second: deviceTime.Second || ''
            });
        }
    }, [deviceTime]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTime(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(time);
    };

    // Format current device time for display
    const currentDeviceTime = deviceTime ?
        `${deviceTime.Day?.toString().padStart(2, '0') || '--'}/${deviceTime.Month?.toString().padStart(2, '0') || '--'}/${deviceTime.Year || '----'} ${deviceTime.Hour?.toString().padStart(2, '0') || '--'}:${deviceTime.Minute?.toString().padStart(2, '0') || '--'}:${deviceTime.Second?.toString().padStart(2, '0') || '--'}`
        : 'Not available';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set Device Time">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Device Time Display */}
                <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Current Device Time</h3>
                            <p className="mt-1 text-lg font-semibold text-blue-600">{currentDeviceTime}</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-2">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Date Fields Row */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                        <input
                            type="number"
                            name="Day"
                            value={time.Day}
                            onChange={handleChange}
                            min="1"
                            max="31"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <input
                            type="number"
                            name="Month"
                            value={time.Month}
                            onChange={handleChange}
                            min="1"
                            max="12"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                            type="number"
                            name="Year"
                            value={time.Year}
                            onChange={handleChange}
                            min="2000"
                            max="2100"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>
                </div>

                {/* Time Fields Row */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hour</label>
                        <input
                            type="number"
                            name="Hour"
                            value={time.Hour}
                            onChange={handleChange}
                            min="0"
                            max="23"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
                        <input
                            type="number"
                            name="Minute"
                            value={time.Minute}
                            onChange={handleChange}
                            min="0"
                            max="59"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Second</label>
                        <input
                            type="number"
                            name="Second"
                            value={time.Second}
                            onChange={handleChange}
                            min="0"
                            max="59"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
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
                        Set Time
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default SetTimeModal; 