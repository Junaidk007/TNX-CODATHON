import React from 'react';

export function TimelinePage() {
  const phases = [
    {
      id: 'PHASE 01',
      title: 'People + Energy',
      time: '9:00 – 10:00 AM',
      color: 'var(--white)',
      items: [
        { time: '9:00 – 9:45 AM', activity: 'Registration & Check-in' },
        { time: '9:45 – 10:00 AM', activity: 'Welcome + Hackathon Briefing' },
      ],
    },
    {
      id: 'PHASE 02',
      title: 'Build Mode',
      time: '10:00 AM – 1:00 PM',
      color: 'var(--grey)',
      items: [
        { time: '10:00 – 10:15 AM', activity: 'Problem Statement / Rules / Judging Criteria' },
        { time: '10:15 AM – 1:00 PM', activity: 'Hacking / Development Begins' },
        { time: '11:30 – 11:45 AM', activity: '🎯 Fun Activity 1 — Quick Team Challenge' },
      ],
    },
    {
      id: 'PHASE 03',
      title: 'Food + Networking',
      time: '1:00 – 2:00 PM',
      color: 'var(--red3)',
      items: [
        { time: '1:00 – 2:00 PM', activity: '🍱 Lunch Break & Networking' },
      ],
    },
    {
      id: 'PHASE 04',
      title: 'Final Sprint',
      time: '2:00 – 4:00 PM',
      color: 'var(--red)',
      items: [
        { time: '2:00 – 3:45 PM', activity: 'Hacking / Final Development Sprint' },
        { time: '3:00 – 3:15 PM', activity: '🎮 Fun Activity 2 — Rapid-Fire / Tech Game' },
        { time: '3:45 – 4:00 PM', activity: 'Final PPT Deck Submission + Setup for Demos' },
      ],
    },
    {
      id: 'PHASE 05',
      title: 'Demo → Results → Celebration',
      time: '4:00 – 5:00 PM',
      color: 'var(--red2)',
      items: [
        { time: '4:00 – 4:40 PM', activity: '🚀 Project Demos & Pitching (5-7 mins per team)' },
        { time: '4:40 – 4:55 PM', activity: 'Judges Evaluation + Winners Announcement' },
        { time: '4:55 – 5:00 PM', activity: '🏆 Closing Ceremony & Group Photo' },
      ],
    },
  ];

  return (
    <div>
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="wrap">
          <div className="eyebrow">Event Day · 19 August 2026</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}>
            Hackathon <span className="grad-text">Flow</span>
          </h1>
          <p className="dim" style={{ maxWidth: 560, fontSize: 17, marginTop: 16 }}>
            9 AM to 5 PM, five structured phases, one non-stop offline build day at SRMCEM, Lucknow.
          </p>

          {/* Phase Summary Cards */}
          <div className="grid g4" style={{ marginTop: 40 }}>
            {phases.map((p) => (
              <div
                key={p.id}
                className="hud-frame"
                style={{ padding: '18px 16px', borderTop: `2px solid ${p.color}` }}
              >
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: '.08em', color: p.color }}>
                  {p.id}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 8 }}>{p.title}</div>
                <div className="mono dim" style={{ fontSize: 11, marginTop: 6 }}>
                  {p.time}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Timeline Sections */}
          <div style={{ marginTop: 40 }}>
            {phases.map((phase) => (
              <div key={phase.id} style={{ marginTop: 46 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '.1em', color: phase.color }}>
                    {phase.id}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 19 }}>{phase.title}</span>
                  <span className="mono dim" style={{ fontSize: 12 }}>
                    {phase.time}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: `linear-gradient(90deg, ${phase.color}, transparent)`,
                    }}
                  />
                </div>

                <div style={{ borderLeft: `2px solid ${phase.color}`, paddingLeft: 26, marginLeft: 6 }}>
                  {phase.items.map((item, i) => (
                    <div key={i} style={{ position: 'relative', padding: '14px 0' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: -32,
                          top: 20,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: phase.color,
                          boxShadow: '0 0 0 3px rgba(0,0,0,0.8)',
                        }}
                      />
                      <div
                        className="mono"
                        style={{ fontSize: 11.5, color: phase.color, letterSpacing: '.04em' }}
                      >
                        {item.time}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                        {item.activity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
