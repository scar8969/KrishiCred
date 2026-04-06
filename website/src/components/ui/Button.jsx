import React from 'react';
import { MaterialSymbol } from '../utils/MaterialSymbol';

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

const buttonSizes = {
  sm: 'px-4 py-2 text-body-small',
  md: 'px-6 py-4 text-body-medium',
  lg: 'px-8 py-5 text-title-medium',
  xl: 'px-10 py-6 text-display-small',
};

export const Button = React.forwardRef(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    children,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          ${buttonVariants[variant] || ''}
          ${buttonSizes[size] || ''}
          ${className}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.208 0.586 0 0 0 1.96 0 0 2.414 0 0 4-4 4v.013"></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <MaterialSymbol icon={icon} className="mr-2" />
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <MaterialSymbol icon={icon} className="ml-2" />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const IconButton = React.forwardRef(
  ({ className = '', icon, size = 'md', variant = 'ghost', ...props }, ref) => {
    const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

    return (
    <button
      ref={ref}
      className={`
        ${sizeClasses[size] || sizeClasses.md}
        ${buttonVariants[variant] || ''}
        rounded-full
        flex items-center justify-center
        transition-all
        active:scale-95
        ${className}
      `}
      {...props}
    >
      <MaterialSymbol icon={icon} className="text-xl" />
    </button>
  );
});

IconButton.displayName = 'IconButton';
