import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-kc-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                🌾
              </div>
              <span className="text-xl font-bold">KrishiCred</span>
            </div>
            <p className="text-green-100 text-sm">
              Turning pollution into profit through satellite technology and carbon markets.
            </p>
            <p className="text-green-200 text-sm">
              Punjab, India
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-green-100 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/government" className="text-green-100 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/marketplace" className="text-green-100 hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link to="/about" className="text-green-100 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-green-100 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition-colors">Research Papers</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition-colors">Data Sources</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-green-100">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@krishicred.com" className="hover:text-white transition-colors">
                  hello@krishicred.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-green-100">
                <Phone className="w-4 h-4" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-green-200 text-sm">
            © {currentYear} KrishiCred. All rights reserved.
          </p>
          <p className="text-green-200 text-sm">
            Data sources: NASA FIRMS, IPCC, Punjab Agriculture Department
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
