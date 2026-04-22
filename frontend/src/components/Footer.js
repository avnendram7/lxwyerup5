import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 xl:w-9 xl:h-9 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
              <span className="text-xl font-bold">Lxwyer Up</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Simplifying the justice system using technology and AI
            </p>
            <a href="https://www.linkedin.com/company/lxwyerup1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold transition-colors w-fit border border-white/10 shadow-lg">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <span>Follow on LinkedIn</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-slate-400 hover:text-white text-sm transition-colors">About Us</Link>
              <Link to="/features" className="block text-slate-400 hover:text-white text-sm transition-colors">Features</Link>
              <Link to="/contact" className="block text-slate-400 hover:text-white text-sm transition-colors">Contact</Link>
            </div>
          </div>

          {/* For Users */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Users</h3>
            <div className="space-y-2">
              <Link to="/login" className="block text-slate-400 hover:text-white text-sm transition-colors">Client Login</Link>
              <Link to="/login" className="block text-slate-400 hover:text-white text-sm transition-colors">Lawyer Login</Link>
              <Link to="/register" className="block text-slate-400 hover:text-white text-sm transition-colors">Join as Expert</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>avnendram.7@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+91 83182 16968</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>New Delhi, Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
          <p>&copy; 2026 Lxwyer Up. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="https://www.linkedin.com/company/lxwyerup1" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};