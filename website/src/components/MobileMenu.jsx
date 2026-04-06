import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Phone, Mail, Globe } from 'lucide-react';
import { useUIStore, useAuthStore } from '../stores';

const MobileMenu = () => {
  const location = useLocation();
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { language, setLanguage } = useAuthStore();

  if (!mobileMenuOpen) return null;

  const navLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Dashboard', path: '/dashboard/government', icon: '📊' },
    { name: 'Marketplace', path: '/marketplace', icon: '🌱' },
    { name: 'About', path: '/about', icon: 'ℹ️' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleMobileMenu}
      />

      {/* Menu */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kc-green to-kc-light flex items-center justify-center text-white font-bold text-sm">
              🌾
            </div>
            <span className="font-bold text-kc-green">KrishiCred</span>
          </div>
          <button onClick={toggleMobileMenu} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={toggleMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(link.path)
                  ? 'bg-kc-green/10 text-kc-green font-semibold'
                  : 'text-gray-600 hover:text-kc-green hover:bg-green-50'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Language Selector */}
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 px-2 mb-2">Language / ਭਾਸ਼ਾ / भाषा</p>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                language === 'en' ? 'bg-kc-green text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                language === 'hi' ? 'bg-kc-green text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('pa')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                language === 'pa' ? 'bg-kc-green text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ਪੰਜਾਬੀ
            </button>
          </div>
        </div>

        {/* Contact */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <a href="tel:+919876543210" className="flex items-center gap-3 px-4 py-3 bg-kc-green text-white rounded-lg">
            <Phone className="w-5 h-5" />
            <span className="font-medium">Call Now</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
