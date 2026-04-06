import React from 'react';

/**
 * Material Symbols Outlined Icon Component
 * Usage: <MaterialSymbol icon="home" />
 * Full icon list: https://fonts.google.com/icons
 */
export const MaterialSymbol = ({ icon, filled = false, className = '', size = '24px', ...props }) => {
  const symbolClasses = filled
    ? 'material-symbols-outlined filled'
    : 'material-symbols-outlined';

  return (
    <span
      className={`${symbolClasses} ${className}`}
      style={{ fontSize: size, fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
      {...props}
    >
      {icon}
    </span>
  );
};

/**
 * Common icon names used in KrishiCred
 */
export const Icons = {
  // Navigation
  home: 'home',
  dashboard: 'dashboard',
  notifications: 'notifications',
  account: 'account_circle',
  settings: 'settings',
  menu: 'menu',

  // Actions
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  save: 'save',
  cancel: 'close',
  search: 'search',
  filter: 'filter',
  refresh: 'refresh',
  download: 'download',
  share: 'share',
  more: 'more_vert',

  // Agriculture
  agriculture: 'agriculture',
  grass: 'grass',
  nature: 'nature',
  eco: 'eco',
  forest: 'forest',
  terrain: 'terrain',

  // Fire
  local_fire_department: 'local_fire_department',
  wildfire: 'wildfire',
  campfire: 'campfire',
  flame: 'local_fire_department',

  // Carbon/Environment
  co2: 'eco',
  energy_savings_leaf: 'energy_savings_leaf',
  compost: 'compost',
  recycling: 'recycling',

  // Maps/Location
  location_on: 'location_on',
  place: 'place',
  distance: 'straighten',
  route: 'route',

  // Communication
  chat: 'chat',
  whatsapp: 'chat',
  phone: 'phone',
  email: 'mail',
  notifications_active: 'notifications_active',
  notifications_none: 'notifications',

  // Status
  check_circle: 'check_circle',
  error: 'cancel',
  warning: 'warning',
  info: 'info',
  help: 'help',
  pending: 'pending',
  autorenew: 'autorenew',
  verified: 'verified',

  // Finance
  payments: 'payments',
  account_balance_wallet: 'account_balance_wallet',
  sell: 'sell',
  shopping_cart: 'shopping_cart',

  // Weather
  wb_sunny: 'wb_sunny',
  cloud: 'cloud',
  water_drop: 'water_drop',

  // Charts
  trending_up: 'trending_up',
  trending_down: 'trending_down',
  trending_flat: 'trending_flat',
  bar_chart: 'bar_chart',
  show_chart: 'show_chart',

  // Transport
  local_shipping: 'local_shipping',
  truck: 'local_shipping',
  two_wheeler: 'two_wheeler',

  // Time
  calendar_today: 'calendar_today',
  schedule: 'schedule',
  history: 'history',
  access_time: 'access_time',
};
