import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Phone, Mail, Home, BarChart3, ShoppingBag, Info, Wheat } from 'lucide-react';
import { MaterialSymbol } from './utils/MaterialSymbol';
import { useUIStore, useAuthStore } from '../stores';

const Navigation = () => {
  const location = useLocation();
  const { mobileMenuOpen, toggleMobileMenu, toggleSidebar } = useUIStore();
  const { language, setLanguage } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Government', path: '/government', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Plant', path: '/plant', icon: <Wheat className="w-4 h-4" /> },
    { name: 'Fire Map', path: '/fire', icon: <Info className="w-4 h-4" /> },
    { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'About', path: '/about', icon: <Info className="w-4 h-4" /> },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-agri-green to-agri-green-dark flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Wheat className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-kc-green">KrishiCred</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer focus-ring ${
                  isActive(link.path)
                    ? 'bg-kc-green/10 text-kc-green font-semibold'
                    : 'text-gray-600 hover:text-kc-green hover:bg-green-50'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => document.getElementById('lang-dropdown').classList.toggle('hidden')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer focus-ring"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language === 'en' ? 'EN' : language === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}</span>
              </button>
              <div
                id="lang-dropdown"
                className="hidden absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
              >
                <button
                  onClick={() => setLanguage('en')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus-ring"
                >
                  <span className="text-sm font-medium">EN</span> English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus-ring"
                >
                  <span className="text-sm font-medium">HI</span> हिंदी
                </button>
                <button
                  onClick={() => setLanguage('pa')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus-ring"
                >
                  <span className="text-sm font-medium">PA</span> ਪੰਜਾਬੀ
                </button>
              </div>
            </div>

            {/* Contact Button */}
            <a href="tel:+919876543210" className="flex items-center gap-2 px-4 py-2 bg-kc-green text-white rounded-lg hover:bg-kc-light transition-colors cursor-pointer focus-ring">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Contact</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer focus-ring"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
