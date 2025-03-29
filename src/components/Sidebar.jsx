import { useLocation } from 'react-router-dom';

function Sidebar({ devices = [], loading, error, onDeviceSelect, selectedDeviceId }) {
    const location = useLocation();

    // Only show sidebar on home page
    if (location.pathname !== '/') {
        return null;
    }

    if (loading) {
        return (
            <div className="fixed left-0 top-[64px] bottom-[48px] w-[300px] bg-white shadow-lg">
                <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed left-0 top-[64px] bottom-[48px] w-[300px] bg-white shadow-lg">
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
                    <div className="space-y-2">
                        {devices.map((device) => (
                            <button
                                key={device.id.id}
                                onClick={() => onDeviceSelect(device)}
                                className={`w-full rounded-lg px-4 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${selectedDeviceId === device.id.id
                                    ? 'bg-blue-50 border-2 border-blue-500'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`font-medium ${selectedDeviceId === device.id.id
                                            ? 'text-blue-700'
                                            : 'text-gray-900'
                                            }`}>
                                            {device.name}
                                        </div>
                                        <div className={`text-sm ${selectedDeviceId === device.id.id
                                            ? 'text-blue-600'
                                            : 'text-gray-500'
                                            }`}>
                                            {device.label || 'No Label'}
                                        </div>
                                    </div>
                                    <div className={`${device.active ? 'text-green-600' : 'text-red-600'}`}>
                                        {device.active ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-wifi"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 18l.01 0" /><path d="M9.172 15.172a4 4 0 0 1 5.656 0" /><path d="M6.343 12.343a8 8 0 0 1 11.314 0" /><path d="M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0" /></svg>

                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-wifi-off"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 18l.01 0" /><path d="M9.172 15.172a4 4 0 0 1 5.656 0" /><path d="M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2" /><path d="M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374" /><path d="M3 3l18 18" /></svg>

                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar; 