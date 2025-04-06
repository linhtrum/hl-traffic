import { useState, useEffect } from 'react';
import Modal from './Modal';

function YellowRedConfigModal({ isOpen, onClose, onSubmit, isSubmitting, error, initialValues }) {
    const [formData, setFormData] = useState({
        Vang: 0,
        Do_cong: 0
    });

    useEffect(() => {
        if (isOpen && initialValues) {
            setFormData({
                Vang: parseInt(initialValues.Vang) || 0,
                Do_cong: parseInt(initialValues.Do_cong) || 0
            });
        }
    }, [isOpen, initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            Vang: formData.Vang,
            Do_cong: formData.Do_cong
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cấu hình thời gian vàng, đỏ">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="Vang" className="block text-sm font-medium text-gray-700">
                        Thời gian vàng (giây)
                    </label>
                    <input
                        type="number"
                        id="Vang"
                        name="Vang"
                        value={formData.Vang}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Nhập thời gian vàng"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="Do_cong" className="block text-sm font-medium text-gray-700">
                        Thời gian làm sạch đỏ + (giây)
                    </label>
                    <input
                        type="number"
                        id="Do_cong"
                        name="Do_cong"
                        value={formData.Do_cong}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Nhập thời gian đỏ cộng"
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

export default YellowRedConfigModal; 