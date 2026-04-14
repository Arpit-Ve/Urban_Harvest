import React from 'react';

const Dropdown = ({ label, options, icon: Icon, error, ...props }) => (
  <div className="space-y-1 w-full">
    {label && <label className="label-premium">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-all duration-300 pointer-events-none">
          <Icon size={18} strokeWidth={2.5} />
        </div>
      )}
      <select
        className={`input-premium appearance-none ${Icon ? 'pl-11' : 'pl-4'} ${error ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
        {...props}
      >
        <option value="" disabled>{props.placeholder || 'Select option'}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-slate-900 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
    {error && <p className="text-[11px] font-semibold text-red-500 ml-1 mt-1 animate-pulse">{error}</p>}
  </div>
);

export default Dropdown;
