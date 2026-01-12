'use client';

import { useState } from 'react';

interface AdminPinManagerProps {
  trainerId: string;
  trainerName: string;
  onActionComplete?: () => void;
}

type PinAction = 'reset' | 'unlock' | 'set_temp';

interface ConfirmDialogState {
  show: boolean;
  action: PinAction | null;
  message: string;
}

/**
 * Admin PIN management controls for a trainer
 */
export function AdminPinManager({
  trainerId,
  trainerName,
  onActionComplete,
}: AdminPinManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tempPin, setTempPin] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    show: false,
    action: null,
    message: '',
  });

  const showConfirm = (action: PinAction, message: string) => {
    setError(null);
    setSuccess(null);
    setConfirmDialog({ show: true, action, message });
  };

  const hideConfirm = () => {
    setConfirmDialog({ show: false, action: null, message: '' });
    setTempPin('');
  };

  const executeAction = async () => {
    const { action } = confirmDialog;
    if (!action) return;

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = '';
      const body: Record<string, string> = { user_id: trainerId };

      switch (action) {
        case 'reset':
          endpoint = '/api/pin/admin/reset';
          break;
        case 'unlock':
          endpoint = '/api/pin/admin/unlock';
          break;
        case 'set_temp':
          if (!/^\d{4}$/.test(tempPin)) {
            setError('PIN must be exactly 4 digits');
            setIsLoading(false);
            return;
          }
          endpoint = '/api/pin/admin/set-temp';
          body.pin = tempPin;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Action failed');
        setIsLoading(false);
        return;
      }

      setSuccess(data.message || 'Action completed');
      hideConfirm();
      onActionComplete?.();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={() =>
          showConfirm(
            'reset',
            `Reset PIN for ${trainerName}? They will need to create a new PIN.`
          )
        }
        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
        disabled={isLoading}
      >
        Reset PIN
      </button>

      <button
        onClick={() =>
          showConfirm(
            'unlock',
            `Unlock account for ${trainerName}? This will clear any lockout.`
          )
        }
        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        disabled={isLoading}
      >
        Unlock
      </button>

      <button
        onClick={() =>
          showConfirm(
            'set_temp',
            `Set a temporary PIN for ${trainerName}? They will be required to change it.`
          )
        }
        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        disabled={isLoading}
      >
        Set Temp PIN
      </button>

      {success && (
        <span className="text-sm text-green-600">{success}</span>
      )}

      {error && !confirmDialog.show && (
        <span className="text-sm text-red-600">{error}</span>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Action
            </h3>
            <p className="text-gray-600 mb-4">{confirmDialog.message}</p>

            {confirmDialog.action === 'set_temp' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary PIN (4 digits)
                </label>
                <input
                  type="tel"
                  maxLength={4}
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0000"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 text-sm text-red-600">{error}</div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={hideConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={isLoading || (confirmDialog.action === 'set_temp' && tempPin.length !== 4)}
                className={`px-4 py-2 rounded font-medium text-white transition-colors ${
                  isLoading || (confirmDialog.action === 'set_temp' && tempPin.length !== 4)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
