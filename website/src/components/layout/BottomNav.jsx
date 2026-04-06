import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/marketplace', icon: 'storefront', label: 'Market' },
  { path: '/government', icon: 'dashboard', label: 'Stats' },
  { path: '/account', icon: 'person', label: 'Account' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white dark:bg-[#121c28] shadow-[0_-4px_40px_rgba(0,0,0,0.06)] rounded-t-[3rem]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center rounded-[3rem] px-5 py-2 transition-all duration-200 ${
              isActive
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 scale-90'
                : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
