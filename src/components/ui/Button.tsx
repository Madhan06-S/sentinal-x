import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans select-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-[0.99]',
    secondary: 'bg-white border border-[#E5E9F0] hover:bg-slate-50 text-slate-800 shadow-xs active:scale-[0.99]',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-[0.99]',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.99]',
    outline: 'border border-[#E5E9F0] hover:bg-slate-50 text-slate-700 active:scale-[0.99]',
    ghost: 'border border-[#E5E9F0] bg-white hover:bg-[#F1F4F9] text-slate-700 active:scale-[0.99]',
    glow: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-[0.99]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-[13px] px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as React.ComponentType<{ className?: string }>;
    return <IconComp className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-current" /> : renderIcon()}
      {children}
    </button>
  );
};
