import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  PlayCircle,
  Activity,
  TrendingUp,
  ShieldCheck,
  Leaf,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Satellite,
  IndianRupee,
  Wheat,
  Sprout,
  Tractor,
  Globe2,
  Coins
} from 'lucide-react';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    setIsLoaded(true);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (prefersReducedMotion) return;
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [prefersReducedMotion, handleMouseMove]);

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {!prefersReducedMotion && (
          <>
            <div
              className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"
              style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '0s' }}
            />
            <div
              className="absolute top-40 right-20 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"
              style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '2s' }}
            />
            <div
              className="absolute bottom-20 left-1/4 w-64 h-64 bg-green-300/20 rounded-full blur-3xl"
              style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '4s' }}
            />
          </>
        )}

        {!prefersReducedMotion && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`,
            }}
          />
        )}

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #059669 1px, transparent 1px), linear-gradient(to bottom, #059669 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Hero Content - pt-20 to account for fixed nav */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Live Status Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-emerald-100 transition-all duration-500 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${
                    prefersReducedMotion ? '' : 'animate-ping'
                  }`}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold text-emerald-700">
                Live Satellite Monitoring Active
              </span>
            </div>

            {/* Main Headline */}
            <div
              className={`space-y-4 transition-all duration-700 delay-100 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Get Paid to Stop
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                    Stubble Burning
                  </span>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
                India's first AI-powered platform that detects crop residue burning via satellite
                and pays farmers to stop. Earn up to{' '}
                <span className="font-semibold text-emerald-600">₹3,000 per acre</span> while
                protecting the environment.
              </p>
            </div>

            {/* Stats Cards */}
            <div
              className={`flex flex-wrap gap-3 transition-all duration-700 delay-200 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
            >
              <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">347</div>
                  <div className="text-xs text-gray-500">Fires Detected</div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">3,000</div>
                  <div className="text-xs text-gray-500">Per Acre</div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">2.5M</div>
                  <div className="text-xs text-gray-500">Tons CO₂ Saved</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
            >
              <Link
                to="/dashboard/government"
                className="group inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  Start Earning Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
              </Link>

              <button
                onClick={scrollToDemo}
                className="group inline-flex items-center gap-3 px-7 py-4 bg-white text-gray-800 rounded-xl font-bold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
                Watch How It Works
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              className={`flex flex-wrap items-center gap-6 text-sm text-gray-500 transition-all duration-700 delay-400 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
            >
              <div className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-emerald-500" />
                <span>NASA Satellite Data</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Government Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>2,500+ Farmers Enrolled</span>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Demo Card */}
          <div
            className={`relative transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-amber-400/20 rounded-3xl blur-3xl" />

            {/* Main Card */}
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">KrishiCred Assistant</div>
                  <div className="text-emerald-100 text-xs">WhatsApp Business • Online</div>
                </div>
                <div className="ml-auto">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full inline-block" />
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-6 space-y-4">
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[280px]">
                    <p className="text-sm flex items-center gap-2">
                      <Wheat className="w-5 h-5 text-amber-500" />
                      <span>नमस्ते Ram Ji!</span>
                    </p>
                    <p className="text-sm mt-2 text-gray-600">
                      Your 5-acre farm has been detected ready for harvest.
                    </p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[280px] border border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Your stubble is worth:
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <Wheat className="w-4 h-4 text-amber-600" />
                          Stubble sale:
                        </span>
                        <span className="font-bold text-emerald-600">₹11,000</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <Sprout className="w-4 h-4 text-green-600" />
                          Carbon credits:
                        </span>
                        <span className="font-bold text-emerald-600">₹4,000</span>
                      </div>
                      <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                        <span className="font-bold text-emerald-800">Total:</span>
                        <span className="text-xl font-bold text-emerald-600">₹15,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Pickup Confirmed!</p>
                      <p className="text-xs text-gray-600">Tomorrow, 8:00 AM • 20 tons</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[200px] shadow-lg">
                    <p className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Payment Sent!
                    </p>
                    <p className="text-xs text-emerald-100 mt-1">₹15,000 via UPI ✓</p>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">5 acres</span> •{' '}
                  <span className="text-gray-500">Ludhiana, Punjab</span>
                </div>
                <button
                  onClick={scrollToDemo}
                  className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 focus:outline-none cursor-pointer"
                >
                  Try Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Floating Stats */}
            <div
              className={`absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-emerald-100 flex items-center gap-2 ${
                prefersReducedMotion ? '' : 'animate-bounce'
              }`}
            >
              <Leaf className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">
                <span className="font-bold text-emerald-600">20 tons</span> CO₂ prevented
              </span>
            </div>

            <div
              className={`absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-amber-100 flex items-center gap-2 ${
                prefersReducedMotion ? '' : 'animate-bounce'
              }`}
              style={prefersReducedMotion ? {} : { animationDelay: '0.5s' }}
            >
              <IndianRupee className="w-5 h-5 text-amber-500" />
              <span className="text-sm">
                <span className="font-bold text-amber-600">₹15,000</span> earned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg
          className="w-full h-16 md:h-20"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,50 C360,100 1080,100 1440,50 L1440,100 L0,100 Z" fill="white" />
        </svg>
      </div>

      {/* Scroll Indicator */}
      {!prefersReducedMotion && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
          <button
            onClick={scrollToDemo}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-500 transition-colors duration-200 focus:outline-none cursor-pointer"
            aria-label="Scroll to learn more"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Hero;
