import React from 'react';
import clsx from 'clsx';

export const Card = React.forwardRef(({ className = '', elevation = 'none', interactive = false, padding = 'normal', children, ...props }, ref) => {
  const elevationClasses = {
    none: '',
    low: 'shadow-sm',
    medium: 'shadow-ambient',
    high: 'shadow-ambient-lg',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      ref={ref}
      className={clsx(
        'bg-surface-container-lowest rounded-card',
        elevationClasses[elevation],
        paddingClasses[padding],
        interactive && 'hover:shadow-ambient-lg cursor-pointer transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ className = '', title, subtitle, action, ...props }) => (
  <div className={clsx('flex items-start justify-between mb-4', className)} {...props}>
    <div>
      {title && <h3 className="font-display text-headline-medium text-on-surface">{title}</h3>}
      {subtitle && <p className="text-body-small text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);

export const CardBody = ({ className = '', children, ...props }) => (
  <div className={clsx('text-body-medium text-on-surface', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', align = 'left', children, ...props }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={clsx('flex items-center gap-3 mt-4 pt-4 border-t border-surface-container', alignClasses[align], className)} {...props}>
      {children}
    </div>
  );
};
