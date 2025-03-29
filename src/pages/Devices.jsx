import { useState, useEffect } from 'react';
import { deviceApi } from '../utils/axiosClient';
import AddDeviceModal from '../components/AddDeviceModal';
import DeviceDetailsModal from '../components/DeviceDetailsModal';
import { useSearchParams } from 'react-router-dom';

function Device() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [totalElements, setTotalElements] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [newDevice, setNewDevice] = useState({
        name: '',
        label: '',
        deviceData: {
            transportConfiguration: {
                clientId: '',
                username: '',
                password: '',
                type: 'MQTT',
                powerMode: 'PSM',
                psmActivityTimer: 9007199254740991,
                edrxCycle: 9007199254740991,
                pagingTransmissionWindow: 9007199254740991
            }
        }
    });
    const [defaultProfile, setDefaultProfile] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Get pagination params from URL
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const sortProperty = searchParams.get('sortProperty') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    useEffect(() => {
        fetchDevices();
    }, [page, pageSize, sortProperty, sortOrder]);

    // Add new useEffect for search filtering
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredDevices(devices);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = devices.filter(device =>
            device.name.toLowerCase().includes(searchLower) ||
            (device.label && device.label.toLowerCase().includes(searchLower))
        );
        setFilteredDevices(filtered);
    }, [searchTerm, devices]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchDevices = async () => {
        try {
            const params = {
                pageSize,
                page,
                sortProperty,
                sortOrder
            };
            const response = await deviceApi.getTenantDevices(params);
            setDevices(response.data.data);
            setTotalElements(response.data.totalElements);
            setHasNext(response.data.hasNext);
        } catch (err) {
            setError('Failed to load devices');
            console.error('Devices error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDefaultProfile = async () => {
        try {
            const response = await deviceApi.getDefaultProfile();
            setDefaultProfile(response.data);
        } catch (err) {
            console.error('Failed to fetch default profile:', err);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Reset to first page when searching
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '0');
            return newParams;
        });
    };

    const handleAddDevice = async () => {
        await fetchDefaultProfile();
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setNewDevice({
            name: '',
            label: '',
            deviceData: {
                transportConfiguration: {
                    clientId: '',
                    username: '',
                    password: '',
                    type: 'MQTT',
                    powerMode: 'PSM',
                    psmActivityTimer: 9007199254740991,
                    edrxCycle: 9007199254740991,
                    pagingTransmissionWindow: 9007199254740991
                }
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const parts = name.split('.');
            if (editingDevice) {
                setEditingDevice(prev => {
                    const newDevice = { ...prev };
                    let current = newDevice;
                    for (let i = 0; i < parts.length - 1; i++) {
                        current[parts[i]] = { ...current[parts[i]] };
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = value;
                    return newDevice;
                });
            } else {
                setNewDevice(prev => {
                    const newDevice = { ...prev };
                    let current = newDevice;
                    for (let i = 0; i < parts.length - 1; i++) {
                        current[parts[i]] = { ...current[parts[i]] };
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = value;
                    return newDevice;
                });
            }
        } else {
            if (editingDevice) {
                setEditingDevice(prev => ({
                    ...prev,
                    [name]: value
                }));
            } else {
                setNewDevice(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { clientId, username, password } = newDevice.deviceData.transportConfiguration;
            const devicePayload = {
                device: {
                    name: newDevice.name,
                    label: newDevice.label,
                    deviceProfileId: {
                        entityType: "DEVICE_PROFILE",
                        id: defaultProfile?.id?.id || "3e234160-b6d2-11ef-a65a-25abfc80bed7"
                    },
                    additionalInfo: {
                        gateway: false,
                        overwriteActivityTime: false,
                        description: ""
                    },
                    customerId: null
                },
                credentials: {
                    credentialsType: "MQTT_BASIC",
                    credentialsId: null,
                    credentialsValue: JSON.stringify({
                        clientId,
                        userName: username,
                        password
                    })
                }
            };
            await deviceApi.createDevice(devicePayload);
            fetchDevices();
            handleCloseAddModal();
        } catch (err) {
            setError('Failed to create device');
            console.error('Create device error:', err);
        }
    };

    const handleEditDevice = async (device) => {
        try {
            const deviceInfoResponse = await deviceApi.getDeviceInfo(device.id.id);
            const deviceInfo = deviceInfoResponse.data;

            const credentialsResponse = await deviceApi.getDeviceCredentials(device.id.id);
            const credentials = JSON.parse(credentialsResponse.data.credentialsValue);

            setEditingDevice({
                ...deviceInfo,
                originalName: deviceInfo.name,
                originalLabel: deviceInfo.label,
                originalCredentials: credentials,
                credentialId: credentialsResponse.data.id.id,
                deviceData: {
                    transportConfiguration: {
                        clientId: credentials.clientId || '',
                        username: credentials.userName || '',
                        password: credentials.password || '',
                        type: 'MQTT',
                        powerMode: 'PSM',
                        psmActivityTimer: 9007199254740991,
                        edrxCycle: 9007199254740991,
                        pagingTransmissionWindow: 9007199254740991
                    }
                }
            });
            setShowEditModal(true);
        } catch (err) {
            setError('Failed to load device information');
            console.error('Load device info error:', err);
        }
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingDevice(null);
    };

    const handleUpdateDevice = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { clientId, username, password } = editingDevice.deviceData.transportConfiguration;

            const hasDeviceInfoChanged =
                editingDevice.name !== editingDevice.originalName ||
                editingDevice.label !== editingDevice.originalLabel;

            const hasCredentialsChanged =
                clientId !== editingDevice.originalCredentials?.clientId ||
                username !== editingDevice.originalCredentials?.userName ||
                password !== editingDevice.originalCredentials?.password;

            let updateType = '';
            if (hasDeviceInfoChanged) {
                const { originalName, originalLabel, originalCredentials, credentialId, ...devicePayload } = editingDevice;
                devicePayload.name = editingDevice.name;
                devicePayload.label = editingDevice.label;

                await deviceApi.updateDevice(devicePayload);
                updateType = 'device information';
            }

            if (hasCredentialsChanged) {
                const credentialsPayload = {
                    id: {
                        id: editingDevice.credentialId
                    },
                    deviceId: {
                        entityType: "DEVICE",
                        id: editingDevice.id.id
                    },
                    credentialsType: "MQTT_BASIC",
                    credentialsValue: JSON.stringify({
                        clientId,
                        userName: username,
                        password
                    }),
                    version: 1
                };
                await deviceApi.updateDeviceCredentials(credentialsPayload);
                updateType = updateType ? 'device information and credentials' : 'credentials';
            }

            if (hasDeviceInfoChanged || hasCredentialsChanged) {
                setSuccessMessage(`Successfully updated ${updateType}`);
                fetchDevices();
                handleCloseEditModal();
            }
        } catch (err) {
            setError('Failed to update device');
            console.error('Update device error:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePaginationChange = (newPage) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', newPage.toString());
            return newParams;
        });
    };

    const handleSortChange = (property, order) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('sortProperty', property);
            newParams.set('sortOrder', order);
            newParams.set('page', '0');
            return newParams;
        });
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!window.confirm('Are you sure you want to delete this device?')) {
            return;
        }

        try {
            await deviceApi.deleteDevice(deviceId);
            setSuccessMessage('Device deleted successfully');
            fetchDevices();
        } catch (err) {
            setError('Failed to delete device');
            console.error('Delete device error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-2 mb-[48px]">
            {successMessage && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your connected devices</p>
            </header>

            {/* Device Statistics Cards */}
            <div className="mb-8 grid grid-cols-3 gap-4">
                {/* Total Devices Card */}
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-600">Total Devices</div>
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{totalElements}</div>
                </div>

                {/* Active Devices Card */}
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-600">Active Devices</div>
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {devices.filter(device => device.active).length}
                    </div>
                </div>

                {/* Inactive Devices Card */}
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-600">Inactive Devices</div>
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">
                        {devices.filter(device => !device.active).length}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search devices by name or label..."
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleAddDevice}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Device
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">Devices List</h2>
                    <div className="flex gap-2">
                        <select
                            value={sortProperty}
                            onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="name">Name</option>
                            <option value="type">Type</option>
                            <option value="createdTime">Created Time</option>
                            <option value="active">Status</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => handleSortChange(sortProperty, e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Label</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredDevices.map((device) => (
                                <tr key={device.id.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">{device.type}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">{device.label}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${device.active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {device.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {new Date(device.createdTime).toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditDevice(device)}
                                                className="rounded-lg p-1 text-green-600 transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDevice(device.id.id)}
                                                className="rounded-lg p-1 text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                    <div className="text-sm text-gray-700">
                        Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePaginationChange(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePaginationChange(page + 1)}
                            disabled={!hasNext}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <AddDeviceModal
                isOpen={showAddModal}
                onClose={handleCloseAddModal}
                onSubmit={handleSubmit}
                device={newDevice}
                onChange={handleInputChange}
                defaultProfile={defaultProfile}
                error={error}
            />

            <AddDeviceModal
                isOpen={showEditModal}
                onClose={handleCloseEditModal}
                onSubmit={handleUpdateDevice}
                device={editingDevice}
                onChange={handleInputChange}
                defaultProfile={defaultProfile}
                error={error}
                isUpdating={isUpdating}
            />

            <DeviceDetailsModal
                isOpen={!!selectedDevice}
                onClose={() => setSelectedDevice(null)}
                device={selectedDevice}
                onEdit={handleEditDevice}
            />
        </div>
    );
}

export default Device; 