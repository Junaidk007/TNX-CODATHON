import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <>
      <div className="checker" />
      <footer>
        <div className="wrap">
          <div className="foot-org">
            <img src="/logo.png" alt="TNX Codathon logo" />
            <span>TNX Codathon 2K26</span>
          </div>

          <div className="foot-grid">
            <div className="fcol">
              <h4>ORGANIZED BY TECHNEEKX</h4>
              <p className="dim" style={{ maxWidth: 280, fontSize: 14 }}>
                India's next generation AI &amp; Innovation Hackathon. Code. Transform. Innovate. An 8-hour offline sprint at SRMCEM, Lucknow.
              </p>
            </div>

            <div className="fcol">
              <h4>Navigate</h4>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/timeline">Timeline</Link>
              <Link to="/teams">Teams</Link>
              <Link to="/contact">Contact</Link>
            </div>

            <div className="fcol">
              <h4>Portal</h4>
              <Link to="/my-team">My Team</Link>
              <Link to="/admin">Admin</Link>
            </div>

            <div className="fcol">
              <h4>Connect</h4>
              <a href="mailto:teamtechneekx@gmail.com">teamtechneekx@gmail.com</a>
              <a href="https://www.techneekx.in" target="_blank" rel="noreferrer">
                www.techneekx.in
              </a>
              <a href="https://www.linkedin.com/company/techneekx" target="_blank" rel="noreferrer">
                LinkedIn @TechNeekX
              </a>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© 2026 TechNeekX — Empowering Innovation</span>
            <span>UNIT / TNX-2K26 · SRMCEM LUCKNOW · 19.08.2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
