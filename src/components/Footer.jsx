// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

export default function Footer() {
  return (
    <footer className="dyptc-footer">
      <div className="footer-content">
        {/* Info Section */}
        <div className="footer-section footer-info">
          <h3>D.Y.P.T.C Lost & Found</h3>
          <p>Helping students recover lost belongings safely.</p>
        </div>

        {/* Quick Links Section (hidden on mobile) */}
        <div className="footer-section footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li className="desktop-only"><Link to="/">Home</Link></li>
            <li className="desktop-only"><Link to="/about">About</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section footer-contact">
          <h4>Contact</h4>
          <p>D.Y.Patil Technical Campus</p>
          <p>Varale, Pune</p>
          <p>Email: support@dyptc.com</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <marquee>© {new Date().getFullYear()} D.Y.P.T.C Lost & Found Portal.</marquee>
      </div>
    </footer>
  );
}