import React from 'react';
import { Shield, Github, ExternalLink } from 'lucide-react';

/**
 * Footer component with links and branding.
 */
const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-transparent rounded-b-[2.5rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1a1a1a]" />
              <span className="text-lg font-bold text-[#1a1a1a]">SANA</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Cybersecurity awareness platform protecting Kazakhstan's digital future
              through education and interactive simulations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="https://cert.gov.kz" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-accent-cyan transition-colors flex items-center gap-1">
                  KZ-CERT <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://egov.kz" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-accent-cyan transition-colors flex items-center gap-1">
                  eGov Kazakhstan <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.kaspersky.kz" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-accent-cyan transition-colors flex items-center gap-1">
                  Kaspersky KZ <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Project
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-accent-cyan transition-colors flex items-center gap-1">
                  <Github className="w-3.5 h-3.5" /> Source Code
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-500">
                  Built for IT Competition 2026
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="cyber-line mt-8 mb-4" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Sana Platform. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Made with 🛡️ in Kazakhstan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
