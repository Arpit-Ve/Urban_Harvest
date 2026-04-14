import React from 'react';

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1 w-full">
    {label && <label className="label-premium">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-all duration-300">
          <Icon size={18} strokeWidth={2.5} />
        </div>
      )}
      <input
        className={`input-premium ${Icon ? 'pl-11' : 'pl-4'} ${error ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-[11px] font-semibold text-red-500 ml-1 mt-1 animate-pulse">{error}</p>}
  </div>
);

export default InputField;
