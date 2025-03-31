import React from 'react';

function TrafficLight({ phase, value, isActive, size = 80 }) {
    // Calculate dimensions based on size prop
    const width = size * 3; // 3 times width for the three lights
    const height = size; // Single height for horizontal layout
    const lightSize = size * 0.6; // 60% of size for the light circles
    const strokeWidth = size * 0.05; // 5% of size for stroke
    const spacing = size * 0.46; // 20% of size for spacing between lights

    // Colors for different states
    const colors = {
        red: isActive ? '#EF4444' : '#F3F4F6', // red-500 : gray-100
        yellow: isActive ? '#F59E0B' : '#F3F4F6', // yellow-500 : gray-100
        green: isActive ? '#10B981' : '#F3F4F6', // green-500 : gray-100
        border: '#D1D5DB' // gray-300
    };

    // console.log(phase, value);

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="relative"
        >
            {/* Background */}
            <rect
                x={0}
                y={0}
                width={width}
                height={height}
                rx={height * 0.2}
                fill="white"
                stroke={colors.border}
                strokeWidth={strokeWidth}
            />

            {/* Red Light */}
            <circle
                cx={lightSize / 2 + spacing}
                cy={height / 2}
                r={lightSize / 2}
                fill={phase === 'Red' ? colors.red : '#F3F4F6'}
                stroke={colors.border}
                strokeWidth={strokeWidth}
            />

            {/* Yellow Light */}
            <circle
                cx={lightSize + spacing * 2}
                cy={height / 2}
                r={lightSize / 2}
                fill={phase === 'Yellow' ? colors.yellow : '#F3F4F6'}
                stroke={colors.border}
                strokeWidth={strokeWidth}
            />

            {/* Green Light */}
            <circle
                cx={lightSize * 1.5 + spacing * 3}
                cy={height / 2}
                r={lightSize / 2}
                fill={phase === 'Green' ? colors.green : '#F3F4F6'}
                stroke={colors.border}
                strokeWidth={strokeWidth}
            />

            {/* Value Text (only show for Red and Green) */}
            {phase !== 'Yellow' && isActive && (
                // {phase === 'Red' ? lightSize / 2 + spacing : lightSize * 1.5 + spacing * 3}
                <text
                    x={phase === 'Red' ? lightSize / 2 + spacing : lightSize * 1.5 + spacing * 3}
                    y={height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={size * 0.4}
                    fontWeight="bold"
                >
                    {value}
                </text>
            )}
        </svg>
    );
}

export default TrafficLight; 