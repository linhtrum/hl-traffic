import { useState, useEffect } from 'react';

function Clock() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-[80px] w-[280px] flex-col items-center justify-center rounded-lg bg-white p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Current Time</div>
            <div className="mt-1 flex items-center gap-2">
                <div className="text-lg font-semibold text-gray-900">
                    {currentTime.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="text-lg font-semibold text-gray-900">
                    {currentTime.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    })}
                </div>
            </div>
            {/* <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Live</span>
            </div> */}
        </div>
    );
}

export default Clock;

