'use client';

import { useRef, useCallback, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  label?: string;
}

/**
 * 4-digit PIN input component with auto-advance between digits
 */
export function PinInput({
  value,
  onChange,
  disabled = false,
  error = false,
  label = 'PIN',
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setInputRef = useCallback((index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  }, []);

  const focusInput = (index: number) => {
    if (index >= 0 && index < 4) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);

    const newValue = value.padEnd(4, ' ').split('');
    newValue[index] = digit;
    const cleanedValue = newValue.join('').replace(/ /g, '');

    onChange(cleanedValue.slice(0, 4));

    // Auto-advance to next input
    if (digit && index < 3) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentValue = value[index] || '';
      if (!currentValue && index > 0) {
        // If current input is empty, move to previous and clear it
        focusInput(index - 1);
        const newValue = value.slice(0, index - 1) + value.slice(index);
        onChange(newValue);
        e.preventDefault();
      } else if (currentValue) {
        // Clear current digit
        const newValue = value.slice(0, index) + value.slice(index + 1);
        onChange(newValue);
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < 3) {
      focusInput(index + 1);
      e.preventDefault();
    } else if (e.key === 'Tab') {
      // Allow default Tab behavior
    } else if (!/^\d$/.test(e.key) && !['Delete', 'Home', 'End'].includes(e.key)) {
      // Prevent non-digit keys except navigation
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    if (digits) {
      onChange(digits);
      focusInput(Math.min(digits.length, 3));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={setInputRef(index)}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`PIN digit ${index + 1} of 4`}
            className={`
              w-14 h-14 text-center text-2xl font-bold
              border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
