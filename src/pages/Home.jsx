import { useState, useEffect } from 'react';
import { deviceApi } from '../utils/axiosClient';
import Sidebar from '../components/Sidebar';
import Device from '../components/Device';
import { useAuthContext } from '../context/AuthContext';

function Home() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setLoading(true);
                let response;

                // Check user scope and fetch devices accordingly
                if (user?.scopes?.includes('CUSTOMER_USER')) {
                    // Fetch devices for customer user
                    response = await deviceApi.getCustomerDevices(user.customerId, {
                        pageSize: 100,
                        page: 0,
                        sortProperty: 'name',
                        sortOrder: 'ASC'
                    });
                } else if (user?.scopes?.includes('TENANT_ADMIN')) {
                    // Fetch devices for tenant admin
                    response = await deviceApi.getTenantDevices({
                        pageSize: 100,
                        page: 0,
                        sortProperty: 'name',
                        sortOrder: 'ASC'
                    });
                } else {
                    throw new Error('Unauthorized: Invalid user scope');
                }

                setDevices(response.data.data);
                // Auto-select the first device if available
                if (response.data.data.length > 0) {
                    setSelectedDeviceId(response.data.data[0].id.id);
                }
            } catch (err) {
                setError('Failed to load devices');
                console.error('Devices error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDevices();
        }
    }, [user]); // Re-run when user changes

    const handleDeviceSelect = (device) => {
        setSelectedDeviceId(device.id.id);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar
                devices={devices}
                loading={loading}
                error={error}
                onDeviceSelect={handleDeviceSelect}
                selectedDeviceId={selectedDeviceId}
            />
            <main className="flex-1 ml-[300px] p-6 mb-[48px]">
                {selectedDeviceId ? (
                    <Device deviceId={selectedDeviceId} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to HL-TRAFFIC</h1>
                        <p className="text-gray-600">Select a device from the sidebar to view its details</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;