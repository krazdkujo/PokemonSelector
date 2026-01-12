'use client';

import { useState, FormEvent } from 'react';
import { PinInput } from './PinInput';

interface PinCreateFormProps {
  onSuccess: () => void;
  isExistingUser?: boolean;
}

/**
 * PIN creation form with confirmation field
 */
export function PinCreateForm({ onSuccess, isExistingUser = false }: PinCreateFormProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    // Validate PINs match
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, confirm_pin: confirmPin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Failed to create PIN');
        setIsSubmitting(false);
        return;
      }

      onSuccess();
    } catch {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isExistingUser ? 'Set Your PIN' : 'Create Your PIN'}
        </h2>
        <p className="text-gray-600 mt-2">
          {isExistingUser
            ? 'Please create a 4-digit PIN to secure your account.'
            : 'Create a 4-digit PIN to protect your trainer account.'}
        </p>
      </div>

      <PinInput
        value={pin}
        onChange={(v) => {
          setPin(v);
          setError(null);
        }}
        disabled={isSubmitting}
        error={!!error}
        label="Enter PIN"
      />

      <PinInput
        value={confirmPin}
        onChange={(v) => {
          setConfirmPin(v);
          setError(null);
        }}
        disabled={isSubmitting}
        error={!!error && pin.length === 4 && confirmPin.length === 4}
        label="Confirm PIN"
      />

      {error && (
        <div className="text-center">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || pin.length !== 4 || confirmPin.length !== 4}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white
          transition-colors
          ${isSubmitting || pin.length !== 4 || confirmPin.length !== 4
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {isSubmitting ? 'Creating PIN...' : 'Create PIN'}
      </button>
    </form>
  );
}
