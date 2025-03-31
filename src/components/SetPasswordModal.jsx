import { useState } from 'react';
import Modal from './Modal';

function SetPasswordModal({ isOpen, onClose, onSubmit, error, isSubmitting }) {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [validationError, setValidationError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError('');

        // Validate password length
        if (formData.password.length < 6 || formData.password.length > 72) {
            setValidationError('Password must be between 6 and 72 characters');
            return;
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        onSubmit(formData.password);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set User Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>

                {(error || validationError) && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                        {error || validationError}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Setting Password...' : 'Set Password'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default SetPasswordModal; 