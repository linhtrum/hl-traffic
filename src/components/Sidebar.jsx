import { useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';

function Sidebar({ devices = [], loading, error, onDeviceSelect, selectedDeviceId }) {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    // Use useMemo to compute filtered devices without state
    const filteredDevices = useMemo(() => {
        if (!searchTerm.trim()) {
            return devices;
        }

        const searchLower = searchTerm.toLowerCase();
        return devices.filter(device =>
            device.name.toLowerCase().includes(searchLower) ||
            (device.label && device.label.toLowerCase().includes(searchLower))
        );
    }, [searchTerm, devices]);

    // Only show sidebar on home page
    if (location.pathname !== '/') {
        return null;
    }

    if (loading) {
        return (
            <div className="fixed left-0 top-[64px] bottom-[48px] w-[300px] bg-gray-50 border-r border-gray-200">
                <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed left-0 top-[64px] bottom-[48px] w-[300px] bg-gray-50 border-r border-gray-200">
                <div className="flex h-full items-center justify-center">
                    <div className="text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed left-0 top-[64px] bottom-[48px] w-[300px] bg-white shadow-lg">
            <div className="h-full overflow-y-auto">
                <div className="p-4">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Devices</h2>

                    {/* Search Field */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search devices..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {searchTerm ? (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-full"
                                    title="Clear search"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : (
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {filteredDevices.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-4">
                                No devices found
                            </div>
                        ) : (
                            filteredDevices.map((device) => (
                                <button
                                    key={device.id.id}
                                    onClick={() => onDeviceSelect(device)}
                                    className={`w-full rounded-lg px-4 py-1.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${selectedDeviceId === device.id.id
                                        ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className={`font-medium ${selectedDeviceId === device.id.id
                                                ? 'text-blue-700'
                                                : 'text-gray-900'
                                                }`}>
                                                {device.label}
                                            </div>
                                            <div className={`text-sm ${selectedDeviceId === device.id.id
                                                ? 'text-blue-600'
                                                : 'text-gray-500'
                                                }`}>
                                                {device.name || 'No Label'}
                                            </div>
                                        </div>
                                        <div className={`${device.active ? 'text-green-600' : 'text-red-600'}`}>
                                            {device.active ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-wifi w-5 h-5">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                    <path d="M12 18l.01 0" />
                                                    <path d="M9.172 15.172a4 4 0 0 1 5.656 0" />
                                                    <path d="M6.343 12.343a8 8 0 0 1 11.314 0" />
                                                    <path d="M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0" />
                                                </svg>
                                            ) : (

                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-wifi-off w-5 h-5">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                    <path d="M12 18l.01 0" />
                                                    <path d="M9.172 15.172a4 4 0 0 1 5.656 0" />
                                                    <path d="M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2" />
                                                    <path d="M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374" />
                                                    <path d="M3 3l18 18" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar; 