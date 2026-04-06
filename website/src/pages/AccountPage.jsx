import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useMarketplaceStore } from '../stores';
import pseudoDatabase from '../services/pseudoDatabase';

const AccountPage = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { cart } = useMarketplaceStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [notification, setNotification] = useState(null);

  // Auth form state
  const [authForm, setAuthForm] = useState({
    name: '',
    phone: '',
    email: '',
    village: '',
    district: 'Ludhiana',
    khasraNumber: '',
    landArea: '',
    password: '',
    confirmPassword: '',
  });

  // Demo user data (when logged in)
  const demoUser = {
    name: user?.name || 'Gurpreet Singh',
    namePa: user?.namePa || 'ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'gurpreet@krishicred.com',
    village: user?.village || 'Rampura',
    district: user?.district || 'Ludhiana',
    khasraNumber: user?.khasraNumber || 'KHS-1234',
    landArea: user?.landArea || 5,
    language: user?.language || 'pa',
    joinedDate: user?.joinedDate || '2024-02-15',
    totalEarned: user?.totalEarned || 45000,
    carbonCredits: user?.carbonCredits || 125,
    stubbleSold: user?.stubbleSold || 25,
  };

  const stats = [
    { label: 'Total Earned', value: `₹${demoUser.totalEarned.toLocaleString()}`, icon: 'payments', color: 'green' },
    { label: 'Carbon Credits', value: `${demoUser.carbonCredits} tCO2e`, icon: 'eco', color: 'emerald' },
    { label: 'Stubble Sold', value: `${demoUser.stubbleSold} tons`, icon: 'agriculture', color: 'amber' },
  ];

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'farm', label: 'Farm Details', icon: 'landscape' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'shield' },
  ];

  const handleLogout = () => {
    logout();
    setNotification({ type: 'success', message: 'Logged out successfully' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle auth form submit
  const handleAuthSubmit = (e) => {
    e.preventDefault();

    if (authMode === 'register') {
      // Validate registration form
      if (!authForm.name || !authForm.phone || !authForm.khasraNumber) {
        setNotification({ type: 'error', message: 'Please fill all required fields' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        setNotification({ type: 'error', message: 'Passwords do not match' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
    }

    // Create user object
    const userData = {
      id: `USER${Date.now()}`,
      name: authForm.name || 'User',
      namePa: authForm.name || 'User',
      phone: authForm.phone,
      email: authForm.email,
      village: authForm.village,
      district: authForm.district,
      khasraNumber: authForm.khasraNumber,
      landArea: authForm.landArea || 0,
      language: 'pa',
      joinedDate: new Date().toISOString(),
      totalEarned: 0,
      carbonCredits: 0,
      stubbleSold: 0,
    };

    // Login user
    login(userData);
    setShowAuthModal(false);
    setNotification({ type: 'success', message: authMode === 'register' ? 'Registration successful!' : 'Login successful!' });
    setTimeout(() => setNotification(null), 3000);

    // Reset form
    setAuthForm({
      name: '',
      phone: '',
      email: '',
      village: '',
      district: 'Ludhiana',
      khasraNumber: '',
      landArea: '',
      password: '',
      confirmPassword: '',
    });
  };

  // If not authenticated, show login/register modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
            notification.type === 'success' ? 'bg-primary-container text-on-primary-container' :
            notification.type === 'error' ? 'bg-error-container text-on-error-container' :
            'bg-surface-container-high text-on-surface'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
            </span>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        <div className="max-w-md mx-auto px-4 pt-24 pb-32">
          <div className="bg-surface-container-lowest rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="signature-gradient text-white p-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                👨‍🌾
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to KrishiCred</h1>
              <p className="text-white/80 text-sm">Earn from stubble, not burning it</p>
            </div>

            {/* Auth Form */}
            <div className="p-8">
              <div className="flex mb-6 bg-surface-container-highest rounded-xl p-1">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                    authMode === 'login' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                    authMode === 'register' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                      placeholder="Enter your name"
                      required={authMode === 'register'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Khasra Number *
                      </label>
                      <input
                        type="text"
                        value={authForm.khasraNumber}
                        onChange={(e) => setAuthForm({ ...authForm, khasraNumber: e.target.value })}
                        className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                        placeholder="KHS-1234"
                        required={authMode === 'register'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          Village
                        </label>
                        <input
                          type="text"
                          value={authForm.village}
                          onChange={(e) => setAuthForm({ ...authForm, village: e.target.value })}
                          className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                          placeholder="Your village"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          District
                        </label>
                        <select
                          value={authForm.district}
                          onChange={(e) => setAuthForm({ ...authForm, district: e.target.value })}
                          className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary appearance-none"
                        >
                          {pseudoDatabase.districts.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Land Area (Acres)
                      </label>
                      <input
                        type="number"
                        value={authForm.landArea}
                        onChange={(e) => setAuthForm({ ...authForm, landArea: e.target.value })}
                        className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                        placeholder="5"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                    placeholder="Enter password"
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                      className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                      placeholder="Confirm password"
                      required={authMode === 'register'}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full signature-gradient text-on-primary py-4 rounded-xl font-bold active:scale-95 transition-all"
                >
                  {authMode === 'login' ? 'Login' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-on-surface-variant">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>

          {/* Demo Login Button */}
          <button
            onClick={() => {
              login({
                id: 'DEMO001',
                name: 'Gurpreet Singh',
                namePa: 'ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ',
                phone: '+91 98765 43210',
                email: 'gurpreet@krishicred.com',
                village: 'Rampura',
                district: 'Ludhiana',
                khasraNumber: 'KHS-1234',
                landArea: 5,
                language: 'pa',
                joinedDate: '2024-02-15',
                totalEarned: 45000,
                carbonCredits: 125,
                stubbleSold: 25,
              });
              setNotification({ type: 'success', message: 'Demo account loaded!' });
              setTimeout(() => setNotification(null), 3000);
            }}
            className="w-full mt-4 py-3 bg-surface-container-low text-on-surface hover:bg-surface-container-high rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">science</span>
            Try Demo Account
          </button>
        </div>
      </div>
    );
  }

  // Authenticated account page
  return (
    <div className="min-h-screen bg-background">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
          notification.type === 'success' ? 'bg-primary-container text-on-primary-container' :
          notification.type === 'error' ? 'bg-error-container text-on-error-container' :
          'bg-surface-container-high text-on-surface'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/10 rounded-full"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="signature-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Account</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              👨‍🌾
            </div>
            <div>
              <h2 className="text-xl font-bold">{demoUser.name}</h2>
              <p className="text-on-primary-container/80">{demoUser.namePa}</p>
              <p className="text-sm text-on-primary-container/70 mt-1">{demoUser.village}, {demoUser.district}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 -mt-8 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">text-{stat.icon}</span>
                <span className="text-xs text-on-surface-variant">{stat.label}</span>
              </div>
              <div className="text-lg font-bold text-on-surface">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-surface-container-high overflow-x-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === item.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-on-surface mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                      <span className="material-symbols-outlined text-on-surface-variant">person</span>
                      <div>
                        <div className="text-xs text-on-surface-variant">Full Name</div>
                        <div className="font-medium">{demoUser.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                      <span className="material-symbols-outlined text-on-surface-variant">phone</span>
                      <div>
                        <div className="text-xs text-on-surface-variant">Phone</div>
                        <div className="font-medium">{demoUser.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                      <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                      <div>
                        <div className="text-xs text-on-surface-variant">Location</div>
                        <div className="font-medium">{demoUser.village}, {demoUser.district}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'farm' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-on-surface mb-4">Farm Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between p-3 bg-surface-container-low rounded-lg">
                      <span className="text-on-surface-variant">Khasra Number</span>
                      <span className="font-medium">{demoUser.khasraNumber}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-surface-container-low rounded-lg">
                      <span className="text-on-surface-variant">Land Area</span>
                      <span className="font-medium">{demoUser.landArea} acres</span>
                    </div>
                    <div className="flex justify-between p-3 bg-surface-container-low rounded-lg">
                      <span className="text-on-surface-variant">Member Since</span>
                      <span className="font-medium">{new Date(demoUser.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-on-surface">Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-on-surface-variant mb-2 block">Language</label>
                    <select className="w-full px-4 py-2 border border-surface-container-highest rounded-lg bg-surface-container-lowest">
                      <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <span className="text-sm">SMS Notifications</span>
                    <button className="w-12 h-6 bg-primary rounded-full relative">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <span className="text-sm">WhatsApp Updates</span>
                    <button className="w-12 h-6 bg-primary rounded-full relative">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-on-surface">Recent Notifications</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-primary-container/30 rounded-lg border-l-4 border-primary">
                    <div className="font-medium text-sm text-on-surface">Payment Received</div>
                    <div className="text-xs text-on-surface-variant mt-1">₹2,200 for 5 acres stubble collection</div>
                    <div className="text-xs text-on-surface-variant mt-1">2 hours ago</div>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg border-l-4 border-primary">
                    <div className="font-medium text-sm text-on-surface">Pickup Scheduled</div>
                    <div className="text-xs text-on-surface-variant mt-1">Tomorrow, 8:00 AM - Satnam BioEnergy</div>
                    <div className="text-xs text-on-surface-variant mt-1">1 day ago</div>
                  </div>
                  <div className="p-3 bg-tertiary-container/30 rounded-lg border-l-4 border-tertiary">
                    <div className="font-medium text-sm text-on-surface">Fire Alert Nearby</div>
                    <div className="text-xs text-on-surface-variant mt-1">Fire detected 3km from your farm</div>
                    <div className="text-xs text-on-surface-variant mt-1">2 days ago</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-on-surface">Security</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
                    <span className="text-sm">Change Password</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
                    <span className="text-sm">Two-Factor Authentication</span>
                    <span className="text-emerald-600 text-xs font-bold">Enabled</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
                    <span className="text-sm">Download My Data</span>
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Link
            to="/marketplace"
            className="mt-6 block bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-on-surface">Your Cart</div>
                <div className="text-sm text-on-surface-variant">{cart.length} items</div>
              </div>
              <div className="text-primary font-semibold flex items-center gap-2">
                View Cart
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>
        )}

        {/* Help & Support */}
        <div className="mt-6 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-3">Need Help?</h3>
          <div className="space-y-2">
            <a href="tel:+919876543210" className="flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg transition-colors">
              <span className="material-symbols-outlined text-primary">call</span>
              <div>
                <div className="text-sm font-medium">Call Support</div>
                <div className="text-xs text-on-surface-variant">+91 98765 43210</div>
              </div>
            </a>
            <a href="mailto:support@krishicred.com" className="flex items-center gap-3 p-3 hover:bg-surface-container-low rounded-lg transition-colors">
              <span className="material-symbols-outlined text-primary">mail</span>
              <div>
                <div className="text-sm font-medium">Email Support</div>
                <div className="text-xs text-on-surface-variant">support@krishicred.com</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default AccountPage;
