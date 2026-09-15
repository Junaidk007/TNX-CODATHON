import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export function HomePage() {
  const [eventData, setEventData] = useState({
    prizePool: '₹10,000+',
    location: 'SRMCEM, Lucknow',
  });
  const [typedText, setTypedText] = useState('');
  const command = './init --event=TNX_CODATHON_2K26 --venue=SRMCEM --mode=offline';

  useEffect(() => {
    // Typewriter effect
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= command.length) {
        setTypedText(command.slice(0, idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.getEventInfo()
      .then((data) => {
        if (data) setEventData(data);
      })
      .catch(() => { });
  }, []);

  const tracks = [
    'AI & Machine Learning',
    'Healthcare Technology',
    'FinTech & Automation',
    'Sustainability & Green Innovation',
    'Smart City Solutions',
    'Cybersecurity',
    'Web & Mobile Applications',
    'Open Innovation',
  ];

  const steps = [
    { num: '01', title: 'Registration Opens' },
    { num: '02', title: 'Application Review' },
    { num: '03', title: 'Team Shortlisting' },
    { num: '04', title: 'Opening Ceremony' },
    { num: '05', title: '8-Hour Build Sprint' },
    { num: '06', title: 'Mentorship Sessions' },
    { num: '07', title: 'Final Evaluation' },
    { num: '08', title: 'Recognition & Awards' },
  ];

  const rewards = [
    {
      title: 'Industry Mentorship',
      desc: 'Direct guidance from tech leaders, AI engineers, and startup founders throughout the sprint.',
    },
    {
      title: 'Networking Opportunities',
      desc: 'Connect with 120+ top collegiate developers, industry mentors, and community organizers.',
    },
    {
      title: 'National Exposure',
      desc: 'Showcase your prototype on a recognized platform powered by TechNeekX & Unstop.',
    },
    {
      title: 'Portfolio Projects',
      desc: 'Build production-ready prototypes that stand out with tangible code and presentation assets.',
    },
    {
      title: 'Internship Opportunities',
      desc: 'Top performing finalists get fast-tracked for technical internships and talent networks.',
    },
    {
      title: 'Certificates & Awards',
      desc: 'Official merit certificates, trophy recognition, and cash prize distribution for winners.',
    },
  ];

  return (
    <div>
      {/* ====== HERO SECTION ====== */}
      <section className="section" style={{ paddingTop: 76 }}>
        <div className="wrap ">
          <div className='flex flex-col justify-center items-center '>
          <div className="eyebrow">India's Next Generation AI &amp; Innovation Hackathon</div>
          <h1>
            Build. Innovate.
            <br />
            <span className="grad-text">Transform.</span>
          </h1>

          <p className="dim" style={{ maxWidth: 580, fontSize: 18, marginTop: 22 }}>
            TNX Codathon 2K26 — an 8-hour non-stop build sprint at SRM Collage of Engineering and Management&amp;
            Technology. Organized by TechNeekX. Bring your ideas to life, offline, on the ground, with the
            people who'll build them with you.
          </p>

          <div style={{ display: 'flex', gap: 16, marginTop: 34, flexWrap: 'wrap' }}>
            <Link to="/my-team" className="btn btn-primary">
              Access My Team →
            </Link>
            <Link to="/about" className="btn btn-ghost">
              Learn About TNX
            </Link>
          </div>

          {/* Interactive Terminal */}
          <div className="terminal" style={{ maxWidth: 640, marginTop: 46 }}>
            <div className="term-bar">
              <span className="term-dot r" />
              <span className="term-dot y" />
              <span className="term-dot g" />
              <span className="term-title">tnx-codathon — zsh</span>
            </div>
            <div className="term-body">
              <div>
                <span className="prompt">$</span> <span>{typedText}</span>
                {typedText.length === command.length && <span className="cursor" />}
              </div>
              <div style={{ marginTop: 8, color: '#888' }}>
                [ OK ] 38 teams loaded · 128 participants · pool_prize={eventData.prizePool || '₹10,000'}
              </div>
              <div style={{ marginTop: 2, color: '#888' }}>
                [ OK ] build_window=08:00:00 status=READY
              </div>
            </div>
          </div>
        </div>
          {/* Quick HUD Stat Frames */}
          <div className="grid g4" style={{ marginTop: 46 }}>
            <div className="hud-frame" style={{ padding: '22px 20px' }}>
              <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em' }}>
                VENUE
              </div>
              <div style={{ fontSize: 16, marginTop: 6, fontWeight: 600 }}>SRMCEM, Lucknow</div>
            </div>

            <div className="hud-frame" style={{ padding: '22px 20px' }}>
              <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em' }}>
                EVENT DATE
              </div>
              <div style={{ fontSize: 16, marginTop: 6, fontWeight: 600 }}>16 September 2026</div>
            </div>

            <div className="hud-frame" style={{ padding: '22px 20px' }}>
              <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em' }}>
                FORMAT
              </div>
              <div style={{ fontSize: 16, marginTop: 6, fontWeight: 600 }}>Offline · 8hr Build</div>
            </div>

            <div
              className="hud-frame"
              style={{ padding: '22px 20px', borderColor: 'rgba(255,42,61,.5)' }}
            >
              <div className="mono" style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--red2)' }}>
                POOL PRIZE
              </div>
              <div style={{ fontSize: 16, marginTop: 6, fontWeight: 600 }}>
                {eventData.prizePool || '₹10,000'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ====== 02 / DOMAINS / TRACKS ====== */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Domains</div>
          <h2>Hackathon tracks</h2>
          <p className="dim" style={{ marginTop: 10, maxWidth: 520 }}>
            Eight open innovation tracks — build wherever your breakthrough idea takes you.
          </p>

          <div className="grid g4" style={{ marginTop: 36 }}>
            {tracks.map((track) => (
              <div key={track} className="panel" style={{ padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{track}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ====== 03 / PROCESS / JOURNEY ====== */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Process</div>
          <h2>Participant journey</h2>
          <div className="grid g4" style={{ marginTop: 36 }}>
            {steps.map((step) => (
              <div key={step.num} className="panel" style={{ padding: 22 }}>
                <div className="mono grad-text" style={{ fontSize: 26, fontWeight: 700 }}>
                  {step.num}
                </div>
                <div style={{ marginTop: 8, fontWeight: 600, fontSize: 15 }}>{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ====== 04 / REWARDS ====== */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Rewards</div>
          <h2>What participants get</h2>
          <div className="grid g3" style={{ marginTop: 36 }}>
            {rewards.map((reward) => (
              <div key={reward.title} className="panel" style={{ padding: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--white)' }}>
                  {reward.title}
                </div>
                <p className="dim" style={{ fontSize: 14, marginTop: 8 }}>
                  {reward.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ====== 05 / FINAL CTA BANNER ====== */}
      <section className="section">
        <div className="wrap">
          <div
            className="hud-frame"
            style={{
              padding: 48,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Already on the roster?
              </div>
              <h2 style={{ fontSize: 32 }}>Head to your team dashboard.</h2>
              <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
                View your confirmed members, update team identity, and submit your presentation deck.
              </p>
            </div>
            <Link to="/my-team" className="btn btn-primary">
              My Team →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
