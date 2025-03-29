import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';

function Header() {
    const { user, logout } = useAuthContext();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white shadow-sm">
            <div className="flex h-full items-center justify-between px-4">
                {/* Logo and Navigation */}
                <div className="flex items-center space-x-8">
                    <div className="flex items-center">
                        <img
                            className="h-8 w-auto object-contain"
                            src={logo}
                            alt="hl-traffic"
                        />
                        <div className="ml-3 text-xl font-semibold text-gray-900">HL-TRAFFIC</div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex space-x-4">
                        <Link
                            to="/"
                            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${location.pathname === '/'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>
                        <Link
                            to="/devices"
                            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${location.pathname === '/devices'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            Devices
                        </Link>
                    </nav>
                </div>

                {/* User Menu */}
                <div className="flex items-center">
                    <div className="relative ml-3" ref={dropdownRef}>
                        <div>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <div className="flex items-center">
                                    <div className="mr-3 text-right">
                                        <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {user?.scopes?.includes('TENANT_ADMIN') ? 'Tenant Admin' : 'User'}
                                        </p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </button>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                <Link
                                    to="/account"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Account
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header; 