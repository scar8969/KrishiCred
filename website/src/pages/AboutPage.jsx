import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Leaf, Globe, Users, Award, TrendingUp, Target, CheckCircle } from 'lucide-react';
import pseudoDatabase from '../services/pseudoDatabase';

const AboutPage = () => {
  const stats = {
    farmers: 15234,
    fires: 73,
    credits: 1250,
    districts: 23,
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-kc-green to-kc-light text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About KrishiCred</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Turning pollution into profit through satellite technology and carbon markets.
            We're on a mission to end stubble burning in Punjab while increasing farmer income.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem We're Solving</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">20 Million Tons Burned</h3>
                    <p className="text-sm text-gray-600">Every October, Punjab farmers burn 20 million tons of paddy stubble.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">44% of Delhi's Pollution</h3>
                    <p className="text-sm text-gray-600">Stubble burning contributes nearly half of Delhi's winter smog.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Farmer Economics</h3>
                    <p className="text-sm text-gray-600">Farmers burn because alternatives cost more. The math doesn't work.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <h3 className="font-semibold text-gray-900 mb-4">Why Current Solutions Fail</h3>
              <div className="space-y-3">
                {[
                  'Fines are politically sensitive and impossible to enforce',
                  'Happy Seeder subsidy doesn\'t cover the full cost',
                  'Awareness campaigns don\'t address the economics',
                  'Bio-gas plants struggle with unreliable supply',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <XCircle className="w-4 h-4 text-red-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solution</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make not burning more profitable than burning by creating a new market for stubble.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Satellite Detection',
                description: 'AI monitors farms using NASA/ESA satellites to detect fires and harvest timing.',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'WhatsApp Platform',
                description: 'Farmers get Punjabi messages with buyer offers and carbon credit value.',
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: 'Smart Routing',
                description: 'Optimized collection routes match farms to nearest biogas plants.',
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Carbon Credits',
                description: 'Satellite-verified credits sold to ESG buyers, farmers get paid.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-kc-green/10 flex items-center justify-center text-kc-green mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">Real numbers, real impact</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-kc-green">{stats.farmers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Farmers Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">{stats.fires}%</div>
              <div className="text-sm text-gray-600">Burning Reduced</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500">{stats.credits.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Credits Issued (tCO2e)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-500">{stats.districts}</div>
              <div className="text-sm text-gray-600">Districts Covered</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Farmer, Ludhiana',
                content: "I earned ₹15,000 from my 5 acres this year. Earlier, I used to burn because I had no choice. Now I get paid for not burning!",
                avatar: '👨‍🌾',
              },
              {
                name: 'Dr. Priya Sharma',
                role: 'Environmental Scientist',
                content: "KrishiCred's satellite verification is ground-breaking. Finally, we have credible, verifiable carbon credits from agriculture.",
                avatar: '👩‍🔬',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 mb-3">{testimonial.role}</div>
                    <p className="text-sm text-gray-600 italic">"{testimonial.content}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Backed By</h2>
            <p className="text-xl text-gray-600">Partners and investors who believe in our mission</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Punjab Agriculture Dept', type: 'Government' },
              { name: 'Google Earth Engine', type: 'Technology' },
              { name: 'Verra Registry', type: 'Carbon Standard' },
              { name: 'Jio Platforms', type: 'Strategic Partner' },
            ].map((partner, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🤝</div>
                <div className="font-semibold text-gray-900 text-sm">{partner.name}</div>
                <div className="text-xs text-gray-500 mt-1">{partner.type}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-kc-green to-kc-light text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us in Transforming Agriculture</h2>
          <p className="text-xl text-green-100 mb-8">
            Whether you're a farmer, a buyer, or an investor, there's a place for you in the KrishiCred ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard/government"
              className="px-6 py-3 bg-white text-kc-green rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Dashboard
            </Link>
            <Link
              to="/marketplace"
              className="px-6 py-3 bg-kc-gold text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Browse Credits
            </Link>
            <a
              href="mailto:hello@krishicred.com"
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

const XCircle = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

export default AboutPage;
