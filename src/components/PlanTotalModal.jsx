import { useState, useEffect } from 'react';
import Modal from './Modal';

function PlanTotalModal({ isOpen, onClose, onSubmit, isSubmitting, error, initialValue }) {
    const [planTotal, setPlanTotal] = useState('');

    useEffect(() => {
        if (isOpen && initialValue !== 'N/A') {
            setPlanTotal(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleChange = (e) => {
        const value = e.target.value;
        // Only allow numbers and ensure it's between 1 and 6
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 9999)) {
            setPlanTotal(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ Plan_total: parseInt(planTotal) });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cấu hình số lượng kế hoạch">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="Plan_total" className="block text-sm font-medium text-gray-700">
                        Số lượng kế hoạch (1-6)
                    </label>
                    <input
                        type="number"
                        id="Plan_total"
                        name="Plan_total"
                        value={planTotal}
                        onChange={handleChange}
                        min="1"
                        max="6"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Nhập số lượng kế hoạch"
                        required
                    />
                </div>
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default PlanTotalModal; 