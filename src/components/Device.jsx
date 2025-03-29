import { useState, useEffect } from 'react';
import { deviceApi } from '../utils/axiosClient';
import websocketService from '../utils/websocketService';
import AddPlanModal from './AddPlanModal';
import AddProgramModal from './AddProgramModal';
import Clock from './Clock';
import ModeSelectModal from './ModeSelectModal';
import SetTimeModal from './SetTimeModal';
import SetLocationModal from './SetLocationModal';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import TrafficLight from './TrafficLight';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// MapController component to update map center
function MapController({ location }) {
    const map = useMap();

    useEffect(() => {
        if (location) {
            map.setView([location.latitude, location.longitude], map.getZoom());
        }
    }, [location, map]);

    return null;
}

function Device({ deviceId }) {
    const [device, setDevice] = useState(null);
    const [telemetry, setTelemetry] = useState(null);
    const [serverAttributes, setServerAttributes] = useState([]);
    const [sharedAttributes, setSharedAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [showModeModal, setShowModeModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [plans, setPlans] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [selectedPlanNumber, setSelectedPlanNumber] = useState(null);
    const [selectedProgramNumber, setSelectedProgramNumber] = useState(null);
    const [deviceTime, setDeviceTime] = useState(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [deviceLocation, setDeviceLocation] = useState(null);
    const [subscriptionId, setSubscriptionId] = useState(null);

    // Get values from shared attributes
    const getSharedAttributeValue = (key) => {
        const attr = sharedAttributes?.find(attr => attr.key === key);
        if (!attr) return 'N/A';
        return attr.value;
    };

    // Get values from server attributes
    const getServerAttributeValue = (key) => {
        const attr = serverAttributes?.find(attr => attr.key === key);
        if (!attr) return 'N/A';
        return attr.value;
    };

    // Get device location from server attributes
    const getDeviceLocation = () => {
        const latitude = getServerAttributeValue('latitude');
        const longitude = getServerAttributeValue('longitude');

        // Convert to numbers and validate
        const lat = Number(latitude);
        const lng = Number(longitude);

        // Check if the values are valid numbers and within valid coordinate ranges
        if (!isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180) {
            return {
                latitude: lat,
                longitude: lng
            };
        }
        return null;
    };

    // Update device location when server attributes change
    useEffect(() => {
        const location = getDeviceLocation();
        setDeviceLocation(location);
    }, [serverAttributes]);
    // console.log(serverAttributes);
    // console.log(deviceLocation);

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const response = await deviceApi.getDeviceInfo(deviceId);
                setDevice(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch device details');
            } finally {
                setLoading(false);
            }
        };

        fetchDevice();
    }, [deviceId]);
    // console.log(deviceLocation);

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                // Fetch server attributes
                const serverResponse = await deviceApi.getServerAttributes(deviceId);
                setServerAttributes(serverResponse.data);

                // Fetch shared attributes
                const sharedResponse = await deviceApi.getSharedAttributes(deviceId);
                setSharedAttributes(sharedResponse.data);

                // Initialize plans from shared attributes
                const plansData = [];
                for (let i = 1; i <= 6; i++) {
                    const planData = {
                        planNumber: i,
                        hour: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_HH`)?.value) || 0,
                        minute: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_mm`)?.value) || 0,
                        programNumber: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_Pr`)?.value) || 1,
                        enabled: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_ENT`)?.value) === 1
                    };
                    plansData.push(planData);
                }
                setPlans(plansData);

                // Initialize programs from shared attributes
                const programsData = [];
                for (let i = 1; i <= 6; i++) {
                    const programData = {
                        programNumber: i,
                        greenPhase1: parseInt(sharedResponse.data.find(attr => attr.key === `Pr${i}_X1`)?.value) || 0,
                        greenPhase2: parseInt(sharedResponse.data.find(attr => attr.key === `Pr${i}_X2`)?.value) || 0,
                        greenPhase3: parseInt(sharedResponse.data.find(attr => attr.key === `Pr${i}_X3`)?.value) || 0,
                        startPhase1: parseInt(sharedResponse.data.find(attr => attr.key === `Start_Pr${i}_X1`)?.value) || 0,
                        startPhase2: parseInt(sharedResponse.data.find(attr => attr.key === `Start_Pr${i}_X2`)?.value) || 0,
                        startPhase3: parseInt(sharedResponse.data.find(attr => attr.key === `Start_Pr${i}_X3`)?.value) || 0,
                        totalPeriod: parseInt(sharedResponse.data.find(attr => attr.key === `Period_Pr${i}`)?.value) || 0
                    };
                    programsData.push(programData);
                }
                setPrograms(programsData);
            } catch (err) {
                console.error('Failed to fetch attributes:', err);
            }
        };

        if (deviceId) {
            fetchAttributes();
        }
    }, [deviceId]);

    useEffect(() => {
        let mounted = true;
        let currentSubscriptionId = null;

        const setupSubscription = async () => {
            try {
                // Get the token and ensure WebSocket is connected
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No authentication token available');
                    return;
                }

                // Subscribe to device telemetry
                const subId = websocketService.subscribeToDeviceTelemetry(deviceId, (data) => {
                    if (!mounted) return;

                    setTelemetry(data);
                    // Extract time data from telemetry
                    if (data?.data) {
                        const timeData = {
                            Day: data.data.Day?.[0]?.[1],
                            Month: data.data.Month?.[0]?.[1],
                            Year: data.data.Year?.[0]?.[1],
                            Hour: data.data.Hour?.[0]?.[1],
                            Minute: data.data.Minute?.[0]?.[1],
                            Second: data.data.Second?.[0]?.[1]
                        };
                        setDeviceTime(timeData);
                    }
                });

                if (subId) {
                    currentSubscriptionId = subId;
                    setSubscriptionId(subId);
                }
            } catch (error) {
                console.error('Error setting up WebSocket subscription:', error);
            }
        };

        setupSubscription();

        // Cleanup function to unsubscribe when component unmounts or deviceId changes
        return () => {
            mounted = false;
            if (currentSubscriptionId) {
                websocketService.unsubscribeFromDeviceTelemetry(deviceId, currentSubscriptionId);
            }
        };
    }, [deviceId]); // Only re-run if deviceId changes

    const handlePlanClick = (planNumber) => {
        setSelectedPlanNumber(planNumber);
        setShowPlanModal(true);
    };

    const handleAddPlan = async (planData) => {
        try {
            await deviceApi.postSharedAttributes(deviceId, planData);
            const sharedResponse = await deviceApi.getSharedAttributes(deviceId);
            setSharedAttributes(sharedResponse.data);

            const plansData = [];
            for (let i = 1; i <= 6; i++) {
                const planData = {
                    planNumber: i,
                    hour: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_HH`)?.value) || 0,
                    minute: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_mm`)?.value) || 0,
                    programNumber: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_Pr`)?.value) || 1,
                    enabled: parseInt(sharedResponse.data.find(attr => attr.key === `P${i}_ENT`)?.value) === 1
                };
                plansData.push(planData);
            }
            setPlans(plansData);

            setShowPlanModal(false);
            setSelectedPlanNumber(null);
        } catch (err) {
            console.error('Add plan error:', err);
            setError('Failed to add plan');
        }
    };

    const handleProgramClick = (programNumber) => {
        setSelectedProgramNumber(programNumber);
        setShowProgramModal(true);
    };

    const handleAddProgram = async (programData) => {
        try {
            await deviceApi.postSharedAttributes(deviceId, programData);
            const sharedResponse = await deviceApi.getSharedAttributes(deviceId);
            setSharedAttributes(sharedResponse.data);

            const programsData = [];
            for (let i = 1; i <= 6; i++) {
                const programData = {
                    programNumber: i,
                    greenPhase1: parseInt(sharedResponse.data.find(attr => attr.key === `Pr${i}_X1`)?.value) || 0,
                    greenPhase2: parseInt(sharedResponse.data.find(attr => attr.key === `Pr${i}_X2`)?.value) || 0,
                    greenPhase3: parseInt(sharedResponse.data.find(attr => attr.key === `Pr${i}_X3`)?.value) || 0,
                    startPhase1: parseInt(sharedResponse.data.find(attr => attr.key === `Start_Pr${i}_X1`)?.value) || 0,
                    startPhase2: parseInt(sharedResponse.data.find(attr => attr.key === `Start_Pr${i}_X2`)?.value) || 0,
                    startPhase3: parseInt(sharedResponse.data.find(attr => attr.key === `Start_Pr${i}_X3`)?.value) || 0,
                    totalPeriod: parseInt(sharedResponse.data.find(attr => attr.key === `Period_Pr${i}`)?.value) || 0
                };
                programsData.push(programData);
            }
            setPrograms(programsData);

            setShowProgramModal(false);
            setSelectedProgramNumber(null);
        } catch (err) {
            setError('Failed to add program');
            console.error('Add program error:', err);
        }
    };

    const handleModeSelect = async (modeValue) => {
        try {
            await deviceApi.postSharedAttributes(deviceId, {
                Mode: modeValue
            });

            const sharedResponse = await deviceApi.getSharedAttributes(deviceId);
            setSharedAttributes(sharedResponse.data);

            setShowModeModal(false);
        } catch (err) {
            setError('Failed to update mode');
            console.error('Update mode error:', err);
        }
    };

    const handleSetTime = async (timestamp) => {
        try {
            await deviceApi.postSharedAttributes(deviceId, timestamp);
            setShowTimeModal(false);
            setError(null);
        } catch (err) {
            setError('Failed to set device time');
            console.error('Set time error:', err);
        }
    };

    const handleSetLocation = async (location) => {
        try {
            const doubleLocation = {
                latitude: Number(location.latitude),
                longitude: Number(location.longitude)
            };

            await deviceApi.postServerAttributes(deviceId, doubleLocation);
            // Refresh server attributes to get updated location
            const serverResponse = await deviceApi.getServerAttributes(deviceId);
            setServerAttributes(serverResponse.data);
            setDeviceLocation(doubleLocation);
            setError(null);
        } catch (err) {
            setError('Failed to set device location');
            console.error('Set location error:', err);
        }
    };

    const renderTrafficLightPhase = (phaseNumber) => (
        <div className="mb-4 flex flex-col items-center justify-center">
            <div className="relative">
                <TrafficLight
                    phase={telemetry?.data?.[`T_D${phaseNumber}`]?.[0]?.[1] > 0 ? 'Red' :
                        telemetry?.data?.[`T_V${phaseNumber}`]?.[0]?.[1] > 0 ? 'Yellow' : 'Green'}
                    value={telemetry?.data?.[`T_D${phaseNumber}`]?.[0]?.[1] ||
                        telemetry?.data?.[`T_X${phaseNumber}`]?.[0]?.[1] || 0}
                    isActive={true}
                    size={60}
                />
            </div>
            <div className="mb-2 text-lg font-semibold">Phase {phaseNumber}</div>
        </div>
    );

    const PlanConfigSection = () => (
        <section className="w-1/4 rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-red-600">PLAN CONFIG</h2>
            <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                        key={num}
                        onClick={() => handlePlanClick(num)}
                        className="w-full rounded bg-yellow-300 px-4 py-2 text-left transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    >
                        Plan {num}
                    </button>
                ))}
                <button
                    onClick={() => handlePlanClick(0)}
                    className="w-full rounded bg-yellow-300 px-4 py-2 text-left transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                >
                    Vàng, Đỏ+
                </button>
                <button
                    onClick={() => setShowModeModal(true)}
                    className="w-full rounded bg-yellow-300 px-4 py-2 text-left transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                >
                    Chọn chế độ
                </button>
            </div>
        </section>
    );

    const TrafficLightSection = () => {
        const getModeText = (mode) => {
            switch (parseInt(mode)) {
                case 0:
                    return 'Nháy vàng';
                case 1:
                    return 'Tuyến 1';
                case 2:
                    return 'Tuyến 2';
                default:
                    return 'Tự động';
            }
        };

        return (
            <section className="mx-4 flex w-1/2 flex-col rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2 rounded-lg bg-gray-50 p-3">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-600">Plan</div>
                            <div className="text-base">{getSharedAttributeValue('Plan')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-600">Plan Total</div>
                            <div className="text-base">{getSharedAttributeValue('Plan_total')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-600">Program</div>
                            <div className="text-base">{getSharedAttributeValue('Program')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-600">Mode</div>
                            <div className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm">
                                {getModeText(getSharedAttributeValue('Mode'))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center mt-2">
                    <div className="w-full max-w-3xl">
                        {[1, 2, 3].map((phase) => renderTrafficLightPhase(phase))}
                    </div>
                </div>
            </section>
        );
    };

    const ProgramConfigSection = () => (
        <section className="w-1/4 rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-red-600">PROGRAM CONFIG</h2>
            <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleProgramClick(num)}
                        className="w-full rounded bg-yellow-300 px-4 py-2 text-left transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    >
                        Program {num}
                    </button>
                ))}
                <button className="w-full rounded bg-yellow-300 px-4 py-2 text-left transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20">
                    GPS Status
                </button>
                <button
                    onClick={() => setShowTimeModal(true)}
                    className="w-full rounded bg-yellow-300 px-4 py-2 text-left transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                >
                    Set_RTC
                </button>
            </div>
        </section>
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="px-6 py-2">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-500">{device?.name || 'No Label'}</div>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl font-semibold text-gray-900">{device?.label || 'Device Details'}</div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${device?.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {device?.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <Clock />
            </div>

            {/* Traffic Light Control Panel */}
            <div className="mb-6 flex">
                {/* Maps Panel */}
                <section className="w-[50%] rounded-lg bg-white p-4 shadow-sm">
                    <div className="relative z-20 h-full w-full rounded-lg overflow-hidden">
                        <MapContainer
                            center={[10.762622, 106.660172]} // Default center
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <MapController location={deviceLocation} />
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {deviceLocation && (
                                <Marker position={[deviceLocation.latitude, deviceLocation.longitude]}>
                                    <Popup>
                                        <div className="font-medium">{device?.label || 'Device Location'}</div>
                                        <div className="text-sm text-gray-600">{device?.name}</div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                </section>

                {/* Control Panel */}
                <div className="ml-4 flex w-[50%]">
                    <PlanConfigSection />
                    <TrafficLightSection />
                    <ProgramConfigSection />
                </div>
            </div>

            {/* Device Information Section */}
            {device && (
                <div className="mb-6">
                    {/* Status Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* Status Card */}
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-600">Device Status</h3>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${device.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {device.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">{device.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Label</p>
                                    <p className="font-medium">{device.label ? device.label : 'N/A'}</p>
                                </div>
                                <button
                                    onClick={() => setShowLocationModal(true)}
                                    className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    title="Set device location"
                                >
                                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Set Location
                                </button>
                            </div>
                        </div>

                        {/* Last Active Time Card */}
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-600">Last Active Time</div>
                                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="mt-1 text-sm text-gray-900">
                                {getServerAttributeValue('lastActivityTime')
                                    ? new Date(getServerAttributeValue('lastActivityTime')).toLocaleString()
                                    : 'Never'}
                            </div>
                        </div>

                        {/* Last Connection Card */}
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-600">Last Connection</div>
                                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div className="mt-1 text-sm text-gray-900">
                                {getServerAttributeValue('lastConnectTime')
                                    ? new Date(getServerAttributeValue('lastConnectTime')).toLocaleString()
                                    : 'Never'}
                            </div>
                        </div>

                        {/* Last Disconnection Card */}
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-600">Last Disconnection</div>
                                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div className="mt-1 text-sm text-gray-900">
                                {getServerAttributeValue('lastDisconnectTime')
                                    ? new Date(getServerAttributeValue('lastDisconnectTime')).toLocaleString()
                                    : 'Never'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AddPlanModal
                isOpen={showPlanModal}
                onClose={() => {
                    setShowPlanModal(false);
                    setSelectedPlanNumber(null);
                }}
                onSubmit={handleAddPlan}
                deviceId={deviceId}
                planNumber={selectedPlanNumber}
                initialData={plans.find(plan => plan.planNumber === selectedPlanNumber)}
            />

            <AddProgramModal
                isOpen={showProgramModal}
                onClose={() => {
                    setShowProgramModal(false);
                    setSelectedProgramNumber(null);
                }}
                onSubmit={handleAddProgram}
                deviceId={deviceId}
                programNumber={selectedProgramNumber}
                initialData={programs.find(program => program.programNumber === selectedProgramNumber)}
            />

            <ModeSelectModal
                isOpen={showModeModal}
                onClose={() => setShowModeModal(false)}
                currentMode={getSharedAttributeValue('Mode')}
                onModeSelect={handleModeSelect}
            />

            <SetTimeModal
                isOpen={showTimeModal}
                onClose={() => setShowTimeModal(false)}
                onSubmit={handleSetTime}
                deviceTime={deviceTime}
            />

            <SetLocationModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onSubmit={handleSetLocation}
                initialLocation={deviceLocation}
            />
        </div>
    );
}

export default Device; 