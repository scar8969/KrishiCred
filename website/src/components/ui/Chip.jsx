import React from 'react';
import clsx from 'clsx';

export const Chip = ({ label, variant = 'default', size = 'md', icon, onClose, className = '', ...props }) => {
  const variantClasses = {
    default: 'bg-surface-container-high text-on-surface',
    success: 'bg-primary-container text-on-primary-container',
    warning: 'bg-secondary-container text-on-secondary-container',
    error: 'bg-tertiary-container text-on-tertiary-container',
    info: 'bg-surface-container text-on-surface',
    outline: 'border-2 border-outline text-on-surface',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-label-small',
    md: 'px-3 py-1.5 text-label-medium',
    lg: 'px-4 py-2 text-body-small',
  };

  const { MaterialSymbol } = require('../utils/MaterialSymbol');

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        onClose && 'pr-1',
        className
      )}
      {...props}
    >
      {icon && <MaterialSymbol icon={icon} className="text-lg" />}
      <span>{label}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
        >
          <MaterialSymbol icon="close" className="text-lg" />
        </button>
      )}
    </span>
  );
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const { MaterialSymbol } = require('../utils/MaterialSymbol');

  const statusConfig = {
    active: { label: 'Active', color: 'success', icon: 'check_circle' },
    pending: { label: 'Pending', color: 'warning', icon: 'pending' },
    in_progress: { label: 'In Progress', color: 'info', icon: 'autorenew' },
    completed: { label: 'Completed', color: 'success', icon: 'check_circle' },
    failed: { label: 'Failed', color: 'error', icon: 'cancel' },
    verified: { label: 'Verified', color: 'success', icon: 'verified' },
    certified: { label: 'Certified', color: 'success', icon: 'verified' },
    detected: { label: 'Detected', color: 'error', icon: 'local_fire_department' },
    resolved: { label: 'Resolved', color: 'success', icon: 'check_circle' },
    alerting: { label: 'Alerting', color: 'error', icon: 'notifications_active' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      label={config.label}
      variant={config.color}
      size={size}
      icon={config.icon}
    />
  );
};
