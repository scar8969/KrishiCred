import React from 'react';
import clsx from 'clsx';

export const LinearProgress = ({ value = 0, max = 100, size = 'md', color = 'primary', showLabel = false, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary-container',
    tertiary: 'bg-tertiary',
    error: 'bg-error',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || size !== 'sm') && (
        <div className="flex justify-between text-body-small text-on-surface-variant mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={clsx('w-full bg-surface-container rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={clsx('h-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 12,
  color = 'primary',
  showLabel = false,
  label = '',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const normalizedRadius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
    error: 'text-error',
    success: 'text-primary-container',
  };

  return (
    <div className={clsx('inline-flex items-center gap-3', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            className="text-surface-container"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={colorClasses[color]}
            strokeWidth={strokeWidth}
            fill="transparent"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        </svg>
        {showLabel && (
          <div
            className="absolute inset-0 flex items-center justify-center text-body-medium font-semibold"
            style={{ color: 'var(--tw-shadow-opacity)' }}
          >
            {Math.round(percentage)}%
          </div>
        )}
      </div>
      {(label || showLabel) && (
        <div className="text-body-medium text-on-surface">
          {label || `${value}/${max}`}
        </div>
      )}
    </div  );
};

export const CapacityGauge = ({ value = 0, max = 100, size = 'lg', thresholds = { warning: 70, critical: 90 } }) => {
  const percentage = (value / max) * 100;
  const getColor = () => {
    if (percentage >= thresholds.critical) return 'error';
    if (percentage >= thresholds.warning) return 'warning';
    return 'success';
  };

  return (
    <div className="flex items-center gap-4">
      <CircularProgress value={value} max={max} size={size} color={getColor()} />
      <div className="flex-1">
        <div className="text-body-small text-on-surface-variant">Capacity</div>
        <div className="text-display-small font-bold text-on-surface">
          {value} / {max} tons
        </div>
        <LinearProgress value={value} max={max} color={getColor()} />
      </div>
    </div>
  );
};

export const ProgressBar = LinearProgress;
