
import React from 'react';
import { formatCurrency, parseCurrency } from '../utils';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  readOnly = false,
  className = "" 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseCurrency(raw);
    onChange(numeric);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 && !readOnly ? "" : formatCurrency(value)}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
          readOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
        }`}
      />
    </div>
  );
};

export default NumberInput;
