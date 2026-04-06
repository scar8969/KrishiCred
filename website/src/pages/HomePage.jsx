import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  const handleWhatsAppSignup = () => {
    // Open WhatsApp with a pre-filled message
    const message = encodeURIComponent('Hi KrishiCred! I want to register my farm for stubble management.');
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  const handleEmailSignup = (e) => {
    e.preventDefault();
    if (emailInput) {
      navigate('/farmer-journey');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Hero Section */}
      <section className="bg-rural-hero pt-6 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Alert Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary-container/20 rounded-full mb-6">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: '"FILL" 1 }}>
              local_fire_department
            </span>
            <span className="text-on-tertiary-container font-bold text-sm tracking-wide">
              Stubble Management Program Active
            </span>
          </div>

          {/* Headings */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface leading-tight tracking-tight mb-4">
            Turn Stubble Burning Into Profit
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-10">
            ਪਰਾਲੀ ਨੂੰ ਮੁਨਾਫ਼ੇ ਵਿੱਚ ਬਦਲੋ
          </h2>

          {/* CTA */}
          <div className="flex flex-col items-center gap-6">
            <Link
              to="/farmer-journey"
              className="signature-gradient text-on-primary px-10 py-5 rounded-xl font-bold text-xl flex items-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1 }}>
                chat
              </span>
              Register Your Farm
            </Link>
            <p className="text-on-surface-variant font-medium">
              Join the program and earn from your crop residue
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid - Simplified without fake numbers */}
      <section className="px-6 -mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fire Monitoring Card */}
          <Link to="/government" className="bg-surface-container-highest rounded-xl p-8 flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-tertiary text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: '"FILL' 1 }}>
                cell_tower
              </span>
              <span className="bg-tertiary-container text-on-tertiary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Live Detection
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-on-surface mb-1">Fire Monitoring</div>
              <p className="text-on-surface-variant font-medium">Track stubble burning across Punjab</p>
            </div>
          </Link>

          {/* Earnings Card */}
          <div className="bg-secondary-container rounded-xl p-8 flex flex-col justify-between min-h-[180px] text-on-secondary-container">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-on-secondary-container text-4xl" style={{ fontVariationSettings: '"FILL' 1 }}>
                payments
              </span>
              <span className="bg-on-secondary-container text-secondary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Earn
              </span>
            </div>
            <div>
              <div className="text-2xl font-black mb-1">₹3,000 Per Acre</div>
              <p className="text-on-secondary-fixed-variant font-medium">Stubble procurement price (approx.)</p>
            </div>
          </div>

          {/* CO2 Card */}
          <Link to="/marketplace" className="bg-primary-container rounded-xl p-8 flex flex-col justify-between min-h-[180px] text-on-primary-container hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-on-primary-container text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: '"FILL' 1 }}>
                eco
              </span>
              <span className="bg-on-primary-container text-primary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Trade
              </span>
            </div>
            <div>
              <div className="text-2xl font-black mb-1">Carbon Credits</div>
              <p className="text-on-primary-fixed-variant font-medium">Earn from sustainable practices</p>
            </div>
          </Link>
        </div>
      </section>

      {/* How it Works: Asymmetric Layout */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-left max-w-2xl">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Our Process</span>
            <h2 className="text-4xl font-extrabold mt-2">How It Works</h2>
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 bg-surface-container-low rounded-xl aspect-video overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3erhN6yXovcDk5X_a7gQTO9-s8wpCty0L-wMglg1HSLVyDoQ3-1-G3fhRCwmjrcKvD3w4g5E8VAtfYNVGgJHgL2_mRJpJR5Uk1PsXFd3-joRySmR_xXC0MtA-s8iM3z2tgFMrEKGEeY4zbKU2W-7Pd_4hvMadavjtV4GIZTrI912HIM2MBsDM4ojPmYbPqK8CyH45jGWoss-JYLwT2F0Ct33nJzkvlSww9cEkDg-qX7toebOmgjPPBzlkYPdJgHGogno5X8Odnqk"
                  alt="Satellite Detection"
                />
              </div>
              <div className="w-full md:w-1/2">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-on-primary-container text-3xl">
                    satellite_alt
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Satellite Detection</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Satellites identify harvest windows. We alert you exactly when your field is ready for stubble collection, preventing the need for burning.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="w-full md:w-1/2 bg-surface-container-low rounded-xl aspect-video overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKsJHweX9JF37DZ1N5OJHzPaxHrqSQXtTBEbhJS0DCWM03iEX0do2-vgcuAWhFSEJ763UZnf8s-Ygv039Mymo33tyl-BsYp6XbhBeSkHQR36ouRLi11Y_sZVsFfkchYbHsezfAXlpD4hjNjl7if1bQtrnipO0EsaTUEuVOeXlKvaD6bRTFKg24ay3a7jHgsu_xgSICktOGMP1RGq6xmD4ZT7qg0vSWCK7cD56VijUHgrylTMzO3XpqVqOMKunEaIA2wlQht3p6pBM"
                  alt="We Buy Your Stubble"
                />
              </div>
              <div className="w-full md:w-1/2">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-on-secondary-container text-3xl">
                    forklift
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">We Buy Your Stubble</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Our logistics team arrives at your farm within 24 hours of harvest. We collect the stubble and transport it to biomass centers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 bg-surface-container-low rounded-xl aspect-video overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3u4HPhUN4NlbX3gKramqX4uPuBpkBmIgPBgODqhgFdIn80aFF3YUP21PeIJmfe3jcUoMQnA-nU8TJjo3shpxNMtmnPs1Ubi6REQGXIknfu5eXrwPT_aYjOloCQbrIfsjTMOvUh_r581tfp7JefFOm3u3T6HzVbwfJrkQ15EEV1Yh32P3icxHaiRf7mTrDSky5c-ygoFvHsQGz5IHO6kKkAYTazG4FGV81W24B03VzM66CebbBBWEAugyA3_9mH6_7YbIWvQpJ-Hg"
                  alt="Get Paid + Carbon Credits"
                />
              </div>
              <div className="w-full md:w-1/2">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-on-primary text-3xl">
                    currency_rupee
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Get Paid + Carbon Credits</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Receive payment in your bank account plus additional carbon credits—tradable assets that grow over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-6 bg-surface-container-low">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Platform</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/government"
              className="group bg-surface-container-lowest p-6 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center mb-4 group-hover:bg-primary-container/30 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">dashboard</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Government Monitor</h3>
              <p className="text-sm text-on-surface-variant">Fire tracking and compliance</p>
            </Link>

            <Link
              to="/plant"
              className="group bg-surface-container-lowest p-6 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center mb-4 group-hover:bg-secondary-container/30 transition-colors">
                <span className="material-symbols-outlined text-secondary text-2xl">factory</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Plant Operations</h3>
              <p className="text-sm text-on-surface-variant">Biomass collection status</p>
            </Link>

            <Link
              to="/marketplace"
              className="group bg-surface-container-lowest p-6 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center mb-4 group-hover:bg-primary-container/30 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Carbon Marketplace</h3>
              <p className="text-sm text-on-surface-variant">Trade verified carbon credits</p>
            </Link>

            <Link
              to="/farmer-journey"
              className="group bg-surface-container-lowest p-6 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center mb-4 group-hover:bg-tertiary-container/30 transition-colors">
                <span className="material-symbols-outlined text-tertiary text-2xl">agriculture</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Farmer Journey</h3>
              <p className="text-sm text-on-surface-variant">Start earning today</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-on-surface-variant mb-8">
            Choose your preferred registration method
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleWhatsAppSignup}
              className="flex-1 signature-gradient text-on-primary px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL' 1 }}>
                chat_bubble
              </span>
              WhatsApp Signup
            </button>

            <button
              onClick={() => setShowSignup(!showSignup)}
              className="flex-1 bg-surface-container-low text-on-surface px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined">email</span>
              Email Registration
            </button>
          </div>

          {showSignup && (
            <form onSubmit={handleEmailSignup} className="mt-8 bg-surface-container-low p-6 rounded-xl">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 bg-surface-container-lowest rounded-xl border-2 border-surface-container-high focus:border-primary outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-on-background text-surface py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-sm">
            <h2 className="text-3xl font-black text-primary-container mb-6">KrishiCred</h2>
            <p className="text-surface-variant leading-relaxed mb-8">
              Empowering farmers through sustainable stubble management and carbon economy participation in Punjab.
            </p>
            <div className="flex gap-4">
              <button className="bg-surface-container-low text-on-surface px-6 py-3 rounded-full font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">language</span>
                Punjabi / ਪੰਜਾਬੀ
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">Contact</h3>
            <p className="text-surface-variant mb-2">Get in touch with us</p>
            <button
              onClick={handleWhatsAppSignup}
              className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL' 1 }}>
                chat_bubble
              </span>
              WhatsApp Support
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-surface-variant/10 mt-16 pt-8 flex justify-between items-center text-sm text-surface-variant">
          <p>© 2024 KrishiCred. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-primary-container" href="#">Privacy</a>
            <a className="hover:text-primary-container" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
