import React, { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div>
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="wrap">
          <div className="eyebrow">Get In Touch</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)' }}>
            Contact <span className="grad-text">TechNeekX</span>
          </h1>
          <p className="dim" style={{ maxWidth: 520, fontSize: 17, marginTop: 18 }}>
            Questions about TNX Codathon 2K26, your team registration, or partnering with us — reach out directly.
          </p>

          <div
            className="grid g2"
            style={{ marginTop: 44, gap: 40, alignItems: 'flex-start' }}
          >
            {/* Direct Connect Info */}
            <div>
              <div className="grid" style={{ gap: 14 }}>
                <a
                  className="hud-frame"
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  href="mailto:teamtechneekx@gmail.com"
                >
                  <div>
                    <div className="mono dim" style={{ fontSize: 11 }}>
                      EMAIL
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>teamtechneekx@gmail.com</div>
                  </div>
                  <span className="mono" style={{ color: 'var(--white)' }}>
                    →
                  </span>
                </a>

                <a
                  className="hud-frame"
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  href="https://www.techneekx.in"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <div className="mono dim" style={{ fontSize: 11 }}>
                      WEBSITE
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>www.techneekx.in</div>
                  </div>
                  <span className="mono" style={{ color: 'var(--white)' }}>
                    →
                  </span>
                </a>

                <a
                  className="hud-frame"
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  href="https://twitter.com/TheTechNeekX"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <div className="mono dim" style={{ fontSize: 11 }}>
                      SOCIAL
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>@TheTechNeekX</div>
                  </div>
                  <span className="mono" style={{ color: 'var(--white)' }}>
                    →
                  </span>
                </a>

                <a
                  className="hud-frame"
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  href="https://www.linkedin.com/company/techneekx"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <div className="mono dim" style={{ fontSize: 11 }}>
                      LINKEDIN
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>TechNeekX Community</div>
                  </div>
                  <span className="mono" style={{ color: 'var(--white)' }}>
                    →
                  </span>
                </a>
              </div>

              {/* Venue Card */}
              <div className="panel" style={{ marginTop: 24, padding: 22 }}>
                <div className="mono dim" style={{ fontSize: 11 }}>
                  VENUE
                </div>
                <div style={{ marginTop: 6, fontWeight: 600, fontSize: 16 }}>
                  Ambalika Institute of Management &amp; Technology
                </div>
                <div className="dim" style={{ fontSize: 14, marginTop: 4 }}>
                  Maurawan Road, Mohanlalganj, Lucknow, Uttar Pradesh 226301
                </div>
              </div>
            </div>

            {/* Message Form */}
            <form className="panel" style={{ padding: 28 }} onSubmit={handleSubmit}>
              <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em', marginBottom: 18 }}>
                SEND A MESSAGE
              </div>

              {submitted ? (
                <div className="hud-frame p-6 text-center border-[var(--red2)]">
                  <div className="grad-text mono font-bold">TRANSMISSION RECEIVED</div>
                  <p className="dim text-xs mt-2">
                    Thank you! The TechNeekX organizing team will respond to your email shortly.
                  </p>
                </div>
              ) : (
                <div className="grid" style={{ gap: 16 }}>
                  <div>
                    <label className="mono dim" style={{ fontSize: 11 }}>
                      NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: 6,
                        padding: '12px 14px',
                      }}
                    />
                  </div>

                  <div>
                    <label className="mono dim" style={{ fontSize: 11 }}>
                      EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: 6,
                        padding: '12px 14px',
                      }}
                    />
                  </div>

                  <div>
                    <label className="mono dim" style={{ fontSize: 11 }}>
                      MESSAGE
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we help your team?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: 6,
                        padding: '12px 14px',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>
                    Send Message →
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
