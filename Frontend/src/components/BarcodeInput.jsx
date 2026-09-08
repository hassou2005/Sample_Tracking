import React, { useRef, useEffect } from 'react';
import { ScanBarcode, CornerDownLeft } from 'lucide-react';

export const BarcodeInput = ({
  value = '',
  onChange,
  onSubmit,
  autoFocus = true,
  placeholder = "Scan Code 128 barcode or type sample code...",
  disabled = false,
  keepFocused = true,
  className = ""
}) => {
  const inputRef = useRef(null);

  const focusInput = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (autoFocus) {
      focusInput();
    }
  }, [autoFocus, disabled]);

  // Keep focused on window / container click if keepFocused is enabled
  useEffect(() => {
    if (!keepFocused || disabled) return;

    const handleGlobalClick = (e) => {
      // Avoid stealing focus from other buttons/inputs/selects
      const targetTag = e.target.tagName.toLowerCase();
      if (['input', 'textarea', 'select', 'button', 'a'].includes(targetTag)) {
        return;
      }
      focusInput();
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [keepFocused, disabled]);

  // Sécurisation contre les valeurs undefined ou null
  const safeValue = value ?? '';
  const trimmedValue = safeValue.trim();

  const handleSubmit = () => {
    if (onSubmit && trimmedValue) {
      onSubmit(trimmedValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <ScanBarcode className="h-5 w-5 text-emerald-400 animate-pulse" />
      </div>
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        value={safeValue}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`block w-full pl-11 pr-32 py-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-xl transition-all disabled:bg-slate-900/40 disabled:text-slate-500 ${className}`}
      />
      <div className="absolute inset-y-0 right-1.5 flex items-center space-x-1">
        <button
          type="button"
          disabled={disabled || !trimmedValue}
          onClick={handleSubmit}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
        >
          <span>Submit</span>
          <CornerDownLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BarcodeInput;