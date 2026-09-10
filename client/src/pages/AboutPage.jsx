import React from 'react';

export function AboutPage() {
  const stats = [
    { value: '500+', label: 'Participants at InnVedX' },
    { value: '200+', label: 'Teams Managed' },
    { value: '250+', label: 'Participants at Kalpathon 2.0' },
    { value: '5+', label: 'Hackathon & Tech Events' },
  ];

  const pillars = [
    {
      title: 'Innovation',
      desc: 'Pushing creative boundaries with cutting-edge AI, intelligent agents, and emerging technologies.',
    },
    {
      title: 'Collaboration',
      desc: 'Cross-functional teamwork bringing designers, full-stack builders, and domain thinkers together.',
    },
    {
      title: 'Scalability',
      desc: 'Building real-world architectural solutions that can grow, deploy, and create tangible social impact.',
    },
    {
      title: 'Startup Mindset',
      desc: 'From initial ideation to swift execution with relentless product discipline and founder mentality.',
    },
  ];

  const capabilities = [
    'Designing',
    'Frontend',
    'Operational Resource Mgmt.',
    'Full Stack',
    'Media',
    'Database & Analysis',
    'DSA (Java)',
    'AI/ML',
    'Life & Academics',
    'Robotics',
    'Lounge',
    'Orating & Lits',
  ];

  return (
    <div>
      {/* ====== HEADER ====== */}
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="wrap">
          <div className="eyebrow">Who We Are</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)' }}>
            About <span className="grad-text">TechNeekX</span>
          </h1>
          <p className="dim" style={{ maxWidth: 600, fontSize: 17, marginTop: 20 }}>
            TechNeekX is an AI-first innovation community driving the future of technology through
            hackathons, AI development, startup culture, and cross-disciplinary collaboration. We empower
            the next generation of builders and innovators.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <span className="badge">AI &amp; Machine Learning</span>
            <span className="badge">Software Development</span>
            <span className="badge">Startup Culture</span>
            <span className="badge">Community Building</span>
            <span className="badge">Hackathons &amp; Events</span>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ====== TRACK RECORD ====== */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Track Record</div>
          <h2>Our impact so far</h2>
          <div className="grid g4" style={{ marginTop: 36 }}>
            {stats.map((item) => (
              <div key={item.label} className="hud-frame" style={{ padding: '26px 20px' }}>
                <div className="grad-text mono" style={{ fontSize: 34, fontWeight: 700 }}>
                  {item.value}
                </div>
                <div className="dim" style={{ fontSize: 13, marginTop: 6 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ====== PURPOSE / THE VISION ====== */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Purpose</div>
          <h2>The vision</h2>
          <p className="dim" style={{ marginTop: 10, maxWidth: 560 }}>
            TNX Codathon 2K26 is built on four foundational pillars that drive every aspect of the event experience.
          </p>

          <div className="grid g2" style={{ marginTop: 32 }}>
            {pillars.map((pillar) => (
              <div key={pillar.title} className="panel" style={{ padding: 26 }}>
                <div style={{ fontWeight: 700, fontSize: 19, color: 'var(--white)' }}>
                  {pillar.title}
                </div>
                <p className="dim" style={{ fontSize: 14, marginTop: 8 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ====== COMMUNITY CAPABILITIES ====== */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Community Capabilities</div>
          <h2>What TechNeekX runs on</h2>
          <div className="grid g4" style={{ marginTop: 32 }}>
            {capabilities.map((cap) => (
              <div key={cap} className="panel" style={{ padding: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{cap}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
