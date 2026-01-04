import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full animate-fade-in">
        {label && (
          <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input w-full px-4 py-3 rounded-lg focus:outline-none transition-all ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
