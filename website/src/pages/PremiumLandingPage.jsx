import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Satellite,
  Truck,
  IndianRupee,
  Home,
  ShoppingBag,
  BarChart3,
  User,
  Globe,
  Bell,
  Wifi,
  Wallet,
  Leaf,
  Flame,
} from 'lucide-react';

const PremiumLandingPage = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center px-6 h-16 w-full border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Satellite className="w-6 h-6 text-emerald-600" />
          <span className="text-xl font-black text-emerald-700">KrishiCred</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-emerald-50 transition-all active:scale-95 duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 pt-12 pb-20 px-6 text-center relative overflow-hidden">
          {/* Animated Background Elements */}
          {!prefersReducedMotion && (
            <>
              <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float" />
              <div className="absolute top-40 right-20 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-green-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </>
          )}

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full mb-6">
              <Flame className="w-5 h-5 text-red-600 fill-red-600" />
              <span className="text-red-800 font-bold text-sm tracking-wide">FIRE ALERT: ACTIVE MONITORING</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
              Turn Stubble Burning Into Profit
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-10">
              ਪਰਾਲੀ ਨੂੰ ਮੁਨਾਫ਼ੇ ਵਿੱਚ ਬਦਲੋ
            </h2>
            <div className="flex flex-col items-center gap-6">
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-10 py-5 rounded-xl font-bold text-xl flex items-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                Register Your Farm
              </Link>
              <p className="text-gray-600 font-medium">
                Join 15,000+ Farmers earning Carbon Credits today
              </p>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="px-6 -mt-12 relative z-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fire Card */}
            <div className="bg-white rounded-xl p-8 flex flex-col justify-between min-h-[180px] shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex justify-between items-start">
                <Wifi className="w-10 h-10 text-red-500" />
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Live Detection
                </span>
              </div>
              <div>
                <div className="text-4xl font-black text-gray-900 mb-1">347 Fires Today</div>
                <p className="text-gray-600 font-medium">Satellite hotspots in your region</p>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="bg-amber-100 rounded-xl p-8 flex flex-col justify-between min-h-[180px] shadow-sm hover:shadow-lg transition-shadow border border-amber-200">
              <div className="flex justify-between items-start">
                <Wallet className="w-10 h-10 text-amber-600" />
                <span className="bg-white text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Market Rate
                </span>
              </div>
              <div>
                <div className="text-4xl font-black text-amber-900 mb-1">₹3,000 Per Acre</div>
                <p className="text-amber-700 font-medium">Average stubble procurement price</p>
              </div>
            </div>

            {/* CO2 Card */}
            <div className="bg-emerald-100 rounded-xl p-8 flex flex-col justify-between min-h-[180px] shadow-sm hover:shadow-lg transition-shadow border border-emerald-200">
              <div className="flex justify-between items-start">
                <Leaf className="w-10 h-10 text-emerald-600" />
                <span className="bg-white text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Impact
                </span>
              </div>
              <div>
                <div className="text-4xl font-black text-emerald-900 mb-1">2.5M Tons Saved</div>
                <p className="text-emerald-700 font-medium">CO2 emissions avoided this season</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-left max-w-2xl">
              <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm">Our Process</span>
              <h2 className="text-4xl font-extrabold mt-2">Earn in 3 Simple Steps</h2>
            </div>

            <div className="space-y-16">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2 bg-white rounded-xl aspect-video overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-100 to-blue-100 border border-gray-100">
                  <div className="text-center p-8">
                    <Satellite className="w-24 h-24 text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Satellite Detection Interface</p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                    <Satellite className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Satellite Detection</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Our satellites identify your harvest window in real-time. We'll alert you
                    exactly when your field is ready for stubble collection, preventing any need for fire.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="w-full md:w-1/2 bg-white rounded-xl aspect-video overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 border border-gray-100">
                  <div className="text-center p-8">
                    <Truck className="w-24 h-24 text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Collection Logistics</p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                    <Truck className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">We Buy Your Stubble</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Our procurement logistics team arrives at your farm within 24 hours of harvest.
                    We collect the stubble and transport it to biomass centers.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2 bg-white rounded-xl aspect-video overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 border border-gray-100">
                  <div className="text-center p-8">
                    <IndianRupee className="w-24 h-24 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Instant Payment</p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mb-6">
                    <IndianRupee className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Get Paid + Carbon Credits</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Receive instant payment in your bank account plus additional "KrishiCredits"—
                    tradable carbon assets that grow in value every year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-sm">
              <h2 className="text-3xl font-black text-emerald-400 mb-6">KrishiCred</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Empowering India's farmers through sustainable digital innovation and carbon
                economy participation.
              </p>
              <div className="flex gap-4">
                <button className="bg-gray-800 text-gray-300 px-6 py-3 rounded-full font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <Globe className="w-5 h-5" />
                  Punjabi / ਪੰਜਾਬੀ
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold">Start Now</h3>
              <p className="text-gray-400">Sign up via WhatsApp for instant alerts</p>
              <Link
                to="/register"
                className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                WhatsApp Signup
              </Link>
            </div>
          </div>
          <div className="max-w-6xl mx-auto border-t border-gray-800 mt-16 pt-8 flex justify-between items-center text-sm text-gray-400">
            <p>© 2024 KrishiCred. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-emerald-400 transition-colors cursor-pointer" href="#">Privacy</a>
              <a className="hover:text-emerald-400 transition-colors cursor-pointer" href="#">Terms</a>
            </div>
          </div>
        </footer>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white shadow-lg rounded-t-3xl">
        {/* Home Active */}
        <Link to="/" className="flex flex-col items-center justify-center bg-emerald-100 text-emerald-800 rounded-2xl px-5 py-2 scale-90 transition-transform duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500">
          <Home className="w-5 h-5 fill-current" />
          <span className="font-medium text-xs">Home</span>
        </Link>
        {/* Market */}
        <Link to="/marketplace" className="flex flex-col items-center justify-center text-gray-500 px-5 py-2 hover:bg-emerald-50 rounded-2xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-medium text-xs">Market</span>
        </Link>
        {/* Stats */}
        <Link to="/dashboard/government" className="flex flex-col items-center justify-center text-gray-500 px-5 py-2 hover:bg-emerald-50 rounded-2xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500">
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium text-xs">Stats</span>
        </Link>
        {/* Account */}
        <Link to="/account" className="flex flex-col items-center justify-center text-gray-500 px-5 py-2 hover:bg-emerald-50 rounded-2xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500">
          <User className="w-5 h-5" />
          <span className="font-medium text-xs">Account</span>
        </Link>
      </nav>
    </div>
  );
};

export default PremiumLandingPage;
