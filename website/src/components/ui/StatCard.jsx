import React from 'react';
import { MaterialSymbol } from '../utils/MaterialSymbol';

export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon,
  size = 'normal',
  trend,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  const valueSizeClasses = {
    small: 'text-title-medium',
    normal: 'text-4xl font-bold',
    large: 'text-6xl font-black',
  };

  const trendIcons = {
    up: 'trending_up',
    down: 'trending_down',
    neutral: 'trending_flat',
  };

  const trendColors = {
    up: 'text-primary',
    down: 'text-tertiary',
    neutral: 'text-on-surface-variant',
  };

  return (
    <div
      className={`stats-card ${sizeClasses[size] || sizeClasses.normal} ${className || ''}`}
      {...props}
    >
      {/* Header with icon and chip */}
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <MaterialSymbol icon={icon} className="text-4xl text-primary" />
        )}
        {change && (
          <span className={`
            chip text-xs px-3 py-1
            ${changeType === 'up' ? 'bg-primary-container/20 text-primary' :
              changeType === 'down' ? 'bg-tertiary-container/20 text-tertiary' :
              'bg-surface-container-high text-on-surface-variant'}
          `}>
            {change}
          </span>
        )}
      </div>

      {/* Value */}
      <div className={`${valueSizeClasses[size] || valueSizeClasses.normal} text-on-surface mb-1`}>
        {value}
      </div>

      {/* Subtitle/Trend */}
      {subtitle && (
        <p className="text-body-medium text-on-surface-variant">
          {subtitle}
        </p>
      )}

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-body-small text-on-surface-variant">
          <MaterialSymbol
            icon={trendIcons[trend] || trendIcons.neutral}
            className={trendColors[trend] || trendColors.neutral}
          />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export const StatGrid = ({ children, cols = 3, className = '' }) => {
  const colsClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid gap-6 ${colsClasses[cols] || colsClasses[3]} md:grid-cols-2 lg:grid-cols-${cols} ${className || ''}`}>
      {children}
    </div>
  );
};
