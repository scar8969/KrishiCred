import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MaterialSymbol } from '../utils/MaterialSymbol';
import { Button, IconButton } from '../ui/Button';

export const TopAppBar = ({ title, user, notifications = 0, onMenuClick, className = '', showNavLinks = false }) => {
  const [notificationCount] = useState(notifications);

  return (
    <header className="bg-[#f8f9ff]/80 dark:bg-[#121c28]/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center px-6 h-16 w-full">
      <Link to="/" className="flex items-center gap-2">
        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">g_translate</span>
        <span className="text-xl font-black text-emerald-700 dark:text-emerald-500 font-['Plus_Jakarta_Sans']">KrishiCred</span>
      </Link>

      {/* Desktop Nav Links - shown when showNavLinks is true */}
      {showNavLinks && (
        <div className="hidden md:flex gap-6 mr-6">
          <Link to="/" className="text-emerald-700 dark:text-emerald-400 font-medium cursor-pointer">Home</Link>
          <Link to="/marketplace" className="text-slate-600 dark:text-slate-400 font-medium cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2 rounded-lg transition-colors">Market</Link>
          <Link to="/government" className="text-slate-600 dark:text-slate-400 font-medium cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2 rounded-lg transition-colors">Stats</Link>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-95 duration-150">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
        </button>

        {/* User Avatar - shown if user exists */}
        {user && (
          <div className="hidden md:block w-8 h-8 rounded-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={user.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuD0iCID_cKpnWkPGwCJMuW1-UpGjPeyd1PK9-9PMW64liJxPBs92f4eaKc9zVCwp0DY54fbUzX03LOrAHYY-_LMqX8ShHiMtynvpm_YeYoqjA5_yY55iR1MdQtwyYIUJW24zMiedoUqXGFIF7dblLCvhA4O7PpAd_hudq_gwT6I8Cm-wXZTazb1GcwOaQwhTcBHfeGN92CRC5IMVFblyU_xv7cvYfFAEhrwuq6cyUrDmo2aLBDIR3mvcJAzEY2QgSQiJh5ItZAL8Pk"}
              alt={user.name}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export const AppBar = TopAppBar;
