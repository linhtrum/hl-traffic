import Modal from './Modal';

function ModeSelectModal({ isOpen, onClose, currentMode, onModeSelect }) {
    const modes = [
        { value: 0, label: 'Nháy vàng' },
        { value: 1, label: 'Tuyến 1' },
        { value: 2, label: 'Tuyến 2' },
        { value: 3, label: 'Tự động' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chọn chế độ">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {modes.map((mode) => (
                        <button
                            key={mode.value}
                            onClick={() => onModeSelect(mode.value)}
                            className={`flex items-center justify-center rounded-lg border p-4 text-sm font-medium transition-all ${parseInt(currentMode) === mode.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                                }`}
                        >
                            <span className="flex items-center">
                                {parseInt(currentMode) === mode.value ? (
                                    <svg className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : null}
                                {mode.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
}

export default ModeSelectModal; 