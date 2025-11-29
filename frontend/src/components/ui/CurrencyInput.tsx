import React from 'react';
import { NumericFormat } from 'react-number-format';

interface CurrencyInputProps {
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  helpText?: string;
  suffix?: React.ReactNode;
  error?: string;
}

export default function CurrencyInput({
  id,
  value,
  onChange,
  placeholder,
  label,
  required,
  helpText,
  suffix,
  error
}: CurrencyInputProps) {
  return (
    <div className="relative group">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <NumericFormat
          id={id}
          value={value}
          onValueChange={(values) => {
            onChange(values.value);
          }}
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale={false}
          allowNegative={false}
          placeholder={placeholder}
          className={`w-full pl-4 ${suffix ? 'pr-12' : 'pr-4'} py-4 bg-gray-50 dark:bg-gray-700/50 border-2 rounded-xl text-lg font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none ${
            error 
              ? 'border-red-300 dark:border-red-700 focus:border-red-500' 
              : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
          }`}
          required={required}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
            {suffix}
          </div>
        )}
        <div className={`absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent transition-colors ${
          error ? '' : 'group-hover:border-gray-300 dark:group-hover:border-gray-500'
        }`} />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
