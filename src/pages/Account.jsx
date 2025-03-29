import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { authApi } from '../utils/axiosClient';

function Account() {
    const { user, login } = useAuthContext();
    const [activeTab, setActiveTab] = useState('profile');
    const [userProfile, setUserProfile] = useState(null);
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user?.userId) return;

            try {
                setLoading(true);
                const response = await authApi.getUserProfile(user.userId);
                setUserProfile(response.data);
            } catch (err) {
                setError('Failed to load user profile');
                console.error('Error fetching user profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user?.userId]);

    const validatePhoneNumber = (phone) => {
        // E.164 format validation: +[country code][number]
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phone) return 'Phone number is required';
        if (!phoneRegex.test(phone)) {
            return 'Phone number must be in E.164 format (e.g., +84912345678)';
        }
        return null;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUserProfile(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (name === 'phone') {
            const phoneError = validatePhoneNumber(value);
            if (!phoneError) {
                setError('');
            }
        }
    };

    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSecurityData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (password.length > 72) {
            return 'Password must not exceed 72 characters';
        }
        return null;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate email
        const emailError = validateEmail(userProfile.email);
        if (emailError) {
            setError(emailError);
            return;
        }

        // Validate phone number before submission
        const phoneError = validatePhoneNumber(userProfile.phone);
        if (phoneError) {
            setError(phoneError);
            return;
        }

        try {
            // Update profile
            await authApi.updateUserProfile(userProfile);

            // Get refresh token from localStorage
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Refresh token
            const tokenResponse = await authApi.refreshToken(refreshToken);
            const { token: newToken, refreshToken: newRefreshToken } = tokenResponse.data;

            // Update tokens and user data
            await login(newToken, newRefreshToken);

            setSuccess('Profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate new password
        const passwordError = validatePassword(securityData.newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        // Validate password match
        if (securityData.newPassword !== securityData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            // Call the change password API
            const response = await authApi.changePassword(
                securityData.currentPassword,
                securityData.newPassword
            );

            // Get new tokens from response
            const { token: newToken, refreshToken: newRefreshToken } = response.data;

            // Update tokens and user data using login function
            await login(newToken, newRefreshToken);

            // Clear the form
            setSecurityData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setSuccess('Password changed successfully');
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.message || 'Failed to change password');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-2 mb-[48px]">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your account preferences and security</p>
            </header>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'profile'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'security'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        Security
                    </button>
                </nav>
            </div>

            {/* Error and Success Messages */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
                    {success}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && userProfile && (
                <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Update your personal information and how others see you on the platform.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Last Login Time</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {userProfile.additionalInfo?.lastLoginTs
                                        ? new Date(userProfile.additionalInfo.lastLoginTs).toLocaleString()
                                        : 'Never logged in'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleProfileSubmit} className="space-y-6 p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    name="email"
                                    value={userProfile.email || ''}
                                    onChange={handleProfileChange}
                                    className={`block w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error && error.includes('Email')
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>
                            {error && error.includes('Email') && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={userProfile.firstName || ''}
                                    onChange={handleProfileChange}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                    placeholder="Enter your first name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="lastName"
                                    value={userProfile.lastName || ''}
                                    onChange={handleProfileChange}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <div className="mt-1">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={userProfile.phone || ''}
                                    onChange={handleProfileChange}
                                    className={`block w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error && error.includes('Phone number')
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    placeholder="+84912345678"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Enter phone number in E.164 format (e.g., +84912345678)
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                Update Profile
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your password and account security settings.
                        </p>
                    </div>
                    <form onSubmit={handleSecuritySubmit} className="space-y-6 p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={securityData.currentPassword}
                                    onChange={handleSecurityChange}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                    placeholder="Enter your current password"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={securityData.newPassword}
                                    onChange={handleSecurityChange}
                                    className={`block w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error && error.includes('Password')
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    required
                                    minLength="6"
                                    maxLength="72"
                                    placeholder="Enter your new password"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Password must be between 6 and 72 characters
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={securityData.confirmPassword}
                                    onChange={handleSecurityChange}
                                    className={`block w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error && error.includes('passwords do not match')
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    required
                                    minLength="6"
                                    maxLength="72"
                                    placeholder="Confirm your new password"
                                />
                            </div>
                            {error && error.includes('passwords do not match') && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}

export default Account;