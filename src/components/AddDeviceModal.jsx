import Modal from './Modal';
import { useState } from 'react';

function AddDeviceModal({ isOpen, onClose, onSubmit, device, onChange, defaultProfile, error, isUpdating }) {
    const [copiedField, setCopiedField] = useState(null);
    const [generatedField, setGeneratedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Provide default values if device is null
    const deviceData = device || {
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
    };

    // Determine if we're in edit mode
    const isEditMode = !!device?.id;

    const generateUniqueToken = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 16; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    };

    const handleGenerateToken = (field) => {
        const token = generateUniqueToken();
        onChange({
            target: {
                name: `deviceData.transportConfiguration.${field}`,
                value: token
            }
        });
        setGeneratedField(field);
        setTimeout(() => setGeneratedField(null), 2000);
    };

    const handleCopyToClipboard = async (field, value) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const renderCredentialField = (field, label) => {
        const value = deviceData.deviceData?.transportConfiguration?.[field] || '';
        const isGenerated = generatedField === field;
        const isCopied = copiedField === field;
        const isPassword = field === 'password';

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type={isPassword && !showPassword ? 'password' : 'text'}
                            name={`deviceData.transportConfiguration.${field}`}
                            value={value}
                            onChange={onChange}
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isGenerated ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                }`}
                            required
                            placeholder={`Enter MQTT ${label.toLowerCase()}`}
                            disabled={isUpdating}
                        />
                        {isPassword && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {!value && (
                            <button
                                type="button"
                                onClick={() => handleGenerateToken(field)}
                                className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                title="Generate token"
                                disabled={isUpdating}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        )}
                        {value && (
                            <button
                                type="button"
                                onClick={() => handleCopyToClipboard(field, value)}
                                className={`rounded-lg border p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${isCopied ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                title={isCopied ? "Copied!" : "Copy to clipboard"}
                                disabled={isUpdating}
                            >
                                {isCopied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.164.084.34.084.521v6.519a2.25 2.25 0 01-2.25 2.25h-3a2.25 2.25 0 01-2.25-2.25V6.75c0-.182.03-.357.084-.521m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Device" : "Add New Device"}>
            <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Device Name</label>
                        <input
                            type="text"
                            name="name"
                            value={deviceData.name}
                            onChange={onChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                            placeholder="Enter device name"
                            disabled={isUpdating}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Device Label</label>
                        <input
                            type="text"
                            name="label"
                            value={deviceData.label}
                            onChange={onChange}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            required
                            placeholder="Enter device label"
                            disabled={isUpdating}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">MQTT Credentials</h3>
                    <div className="space-y-4">
                        {renderCredentialField('clientId', 'Client ID')}
                        {renderCredentialField('username', 'Username')}
                        {renderCredentialField('password', 'Password')}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        disabled={isUpdating}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${isUpdating ? 'cursor-not-allowed' : ''
                            }`}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <div className="flex items-center">
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                {isEditMode ? "Updating..." : "Creating..."}
                            </div>
                        ) : (
                            isEditMode ? "Update Device" : "Create Device"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default AddDeviceModal; 