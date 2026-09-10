import React, { forwardRef } from 'react';

/**
 * NocDocument — Render-ready 2-page A4 document matching TNX_CODATHON_Team_NOC_Format.pdf
 * Designed specifically for high-DPI capture with html2canvas and export with jsPDF.
 */
export const NocDocument = forwardRef(({ team, eventInfo }, ref) => {
  if (!team) return null;

  // Build unified member list with lead first
  const lead = team.leadId;
  const rawMembers = Array.isArray(team.memberIds) ? team.memberIds : [];
  const members = [];

  if (lead) {
    members.push({
      name: lead.name || 'Team Lead',
      email: lead.email || '—',
      role: 'Team Leader',
      organisation: lead.organisation || team.organisation || '—',
    });
  }

  rawMembers.forEach((m) => {
    // Avoid duplicate if lead is also in memberIds
    if (lead && (m._id === lead._id || m.email === lead.email)) return;
    members.push({
      name: m.name || 'Team Member',
      email: m.email || '—',
      role: 'Team Member',
      organisation: m.organisation || team.organisation || '—',
    });
  });

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nocNumber = `TNX-NOC-${team.regnId || 'REGISTRY'}`;

  // Event Details with accurate default fallbacks
  const eventStatusFormat = eventInfo?.eventFormat || 'Offline Hackathon';
  const eventDates = eventInfo?.eventDates || '16 September 2026';
  const venueName = eventInfo?.venue || 'Shri Ramswaroop College of Engineering and Management';
  const locationCity = eventInfo?.location || 'Lucknow, UP, India';

  // Common typography & color constants
  const primaryPurple = '#544299';

  return (
    <div ref={ref} style={{ fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif', color: '#1a1a1a', background: '#ffffff' }}>
      {/* ================= PAGE 1 ================= */}
      <div
        id="noc-page-1"
        style={{
          width: '794px',
          height: '1123px',
          padding: '44px 52px 36px 52px',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          position: 'relative',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="/logo.png"
                alt="TNX Logo"
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: primaryPurple, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.15 }}>
                  TNX CODATHON 2026
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '3px' }}>
                  BY TECHNEEKX
                </div>
              </div>
            </div>

            {/* Date & NOC No. with clean key-value layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', minWidth: '230px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <strong style={{ color: '#111', width: '65px', textAlign: 'left', fontSize: '12px' }}>Date:</strong>
                <span style={{ color: '#222', flex: 1, paddingBottom: '2px', paddingLeft: '4px' }}>
                  {formattedDate}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <strong style={{ color: '#111', width: '65px', textAlign: 'left', fontSize: '12px' }}>NOC No.:</strong>
                <span style={{ color: '#222', flex: 1, paddingBottom: '2px', paddingLeft: '4px', fontWeight: 600 }}>
                  {nocNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Purple Divider Line */}
          <div style={{ height: '2px', backgroundColor: primaryPurple, marginTop: '14px', marginBottom: '20px' }} />

          {/* Recipient Block */}
          <div style={{ fontSize: '12.5px', lineHeight: 1.5, marginBottom: '16px', color: '#1f2937' }}>
            <div style={{ fontWeight: 700 }}>To,</div>
            <div style={{ fontWeight: 600 }}>The Head of Institution / Principal / Dean of Academic Affairs,</div>
          </div>

          {/* Subject */}
          <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.45, marginBottom: '16px', color: '#111827' }}>
            Subject: Official Confirmation of Hackathon Finalist Status and Request for Academic Leave and Institutional Support for TNX CODATHON
          </div>

          {/* Salutation & Body */}
          <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#374151', textAlign: 'justify' }}>
            <div style={{ marginBottom: '10px', fontWeight: 600, color: '#111' }}>Respected Sir / Ma'am,</div>

            <p style={{ margin: '0 0 10px 0' }}>
              We write on behalf of the organising team of <strong>TNX CODATHON</strong>, a hackathon conducted by <strong>TechNeekX</strong>. We are pleased to formally confirm that the team listed below, comprising students from your esteemed institution, has been selected as a <strong>Hackathon Finalist</strong> for TNX CODATHON following the evaluation conducted by the organising team.
            </p>

            <p style={{ margin: '0 0 18px 0' }}>
              The team has demonstrated strong technical ability, creative problem-solving, and a spirit of innovation throughout the hackathon. Their selection as finalists represents their achievement and provides them with an opportunity to participate in the final stage of <strong>TNX CODATHON</strong>.
            </p>
          </div>

          {/* Section: EVENT DETAILS */}
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', color: primaryPurple, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            EVENT DETAILS
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '22px' }}>
            <thead>
              <tr style={{ backgroundColor: primaryPurple, color: '#ffffff' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: '34%', fontWeight: 700, border: `1px solid ${primaryPurple}`, letterSpacing: '0.02em' }}>EVENT</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: '66%', fontWeight: 700, border: `1px solid ${primaryPurple}`, letterSpacing: '0.02em' }}>HACKATHON FINALIST</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6.5px 12px', fontWeight: 700, border: '1px solid #e5e7eb', backgroundColor: '#fcfcfd', color: '#1f2937' }}>EVENT STATUS FORMAT</td>
                <td style={{ padding: '6.5px 12px', border: '1px solid #e5e7eb', color: '#1f2937' }}>{eventStatusFormat}</td>
              </tr>
              <tr>
                <td style={{ padding: '6.5px 12px', fontWeight: 700, border: '1px solid #e5e7eb', backgroundColor: '#fcfcfd', color: '#1f2937' }}>DATES</td>
                <td style={{ padding: '6.5px 12px', border: '1px solid #e5e7eb', color: '#1f2937' }}>{eventDates}</td>
              </tr>
              <tr>
                <td style={{ padding: '6.5px 12px', fontWeight: 700, border: '1px solid #e5e7eb', backgroundColor: '#fcfcfd', color: '#1f2937' }}>VENUE</td>
                <td style={{ padding: '6.5px 12px', border: '1px solid #e5e7eb', color: '#1f2937' }}>{venueName}</td>
              </tr>
              <tr>
                <td style={{ padding: '6.5px 12px', fontWeight: 700, border: '1px solid #e5e7eb', backgroundColor: '#fcfcfd', color: '#1f2937' }}>LOCATION</td>
                <td style={{ padding: '6.5px 12px', border: '1px solid #e5e7eb', color: '#1f2937' }}>{locationCity}</td>
              </tr>
              <tr>
                <td style={{ padding: '6.5px 12px', fontWeight: 700, border: '1px solid #e5e7eb', backgroundColor: '#fcfcfd', color: '#1f2937' }}>TEAM NAME</td>
                <td style={{ padding: '6.5px 12px', border: '1px solid #e5e7eb', fontWeight: 700, color: '#111827' }}>{team.teamName}</td>
              </tr>
              <tr>
                <td style={{ padding: '6.5px 12px', fontWeight: 700, border: '1px solid #e5e7eb', backgroundColor: '#fcfcfd', color: '#1f2937' }}>TEAM REGISTRATION ID</td>
                <td style={{ padding: '6.5px 12px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#111827' }}>{team.regnId || '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* Section: SELECTED TEAM MEMBERS */}
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', color: primaryPurple, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            SELECTED TEAM MEMBERS
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: primaryPurple, color: '#ffffff' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: '25%', fontWeight: 700, border: `1px solid ${primaryPurple}`, letterSpacing: '0.02em' }}>FULL NAME</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: '28%', fontWeight: 700, border: `1px solid ${primaryPurple}`, letterSpacing: '0.02em' }}>EMAIL ADDRESS</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: '18%', fontWeight: 700, border: `1px solid ${primaryPurple}`, letterSpacing: '0.02em' }}>ROLE</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: '29%', fontWeight: 700, border: `1px solid ${primaryPurple}`, letterSpacing: '0.02em' }}>COLLEGE / INSTITUTION</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                  <td style={{ padding: '6.5px 10px', fontWeight: 600, border: '1px solid #e5e7eb', color: '#111827' }}>{m.name}</td>
                  <td style={{ padding: '6.5px 10px', border: '1px solid #e5e7eb', color: '#4b5563', fontSize: '10.5px' }}>{m.email}</td>
                  <td style={{ padding: '6.5px 10px', border: '1px solid #e5e7eb', fontWeight: m.role === 'Team Leader' ? 700 : 500, color: m.role === 'Team Leader' ? primaryPurple : '#374151' }}>
                    {m.role}
                  </td>
                  <td style={{ padding: '6.5px 10px', border: '1px solid #e5e7eb', color: '#374151' }}>{m.organisation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div
        id="noc-page-2"
        style={{
          width: '794px',
          height: '1123px',
          padding: '48px 52px 36px 52px',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          position: 'relative',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Section: OUR REQUEST TO YOUR INSTITUTION */}
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', color: primaryPurple, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
            OUR REQUEST TO YOUR INSTITUTION
          </div>

          {/* Highlighted Request Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderLeft: '4px solid #3b82f6',
              padding: '18px 22px',
              borderRadius: '2px',
              fontSize: '11.5px',
              lineHeight: 1.65,
              color: '#1e293b',
              marginBottom: '24px',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <strong>→ Grant of Attendance Leave:</strong> We respectfully request that the above-mentioned student(s) be granted attendance leave for the duration of the hackathon and related official activities, and that their absence be treated as a sanctioned institutional activity rather than an attendance shortfall.
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>→ On-Duty (OD) Status:</strong> Where applicable under your institution's policy, we request that the participating student(s) be granted On-Duty (OD) status for the duration of the event, exempting them from regular attendance requirements and, where institutionally permissible, from any internal academic activities scheduled during the event dates.
            </div>
            <div>
              <strong>→ Institutional Support:</strong> We sincerely request your institution to support and encourage the participation of the above-mentioned students in TNX CODATHON and provide them with the necessary permission to attend and represent their team during the event.
            </div>
          </div>

          {/* Closing Paragraphs */}
          <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#374151', textAlign: 'justify' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              We thank you sincerely for your time and for fostering a culture of innovation and technical excellence within your institution. Should you require any further verification, documentation, or a direct conversation with our organising team regarding the participants or their finalist status, please contact us through the details provided below.
            </p>

            <p style={{ margin: '0 0 24px 0' }}>
              This NOC is issued at the request of the team for submission to the respective colleges/institutions of its members.
            </p>

            <div style={{ fontWeight: 700, marginBottom: '6px', color: '#111' }}>
              Yours sincerely,
            </div>
          </div>

          {/* Signature Block */}
          <div style={{ fontSize: '12px', lineHeight: 1.5, color: '#1f2937' }}>
            <img
              src="/signature.png"
              alt="Signature"
              style={{
                width: '135px',
                height: '55px',
                objectFit: 'contain',
                objectPosition: 'left center',
                display: 'block',
                marginBottom: '6px',
              }}
            />
            <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#111827' }}>
              Sarthak Singhaniya
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>
              TNX Codathon Programme Lead and Founder, TechNeekX
            </div>

            <div style={{ fontSize: '11.5px', marginTop: '4px' }}>
              <strong>Phone:</strong> 63878 60126
            </div>
            <div style={{ fontSize: '11.5px', marginTop: '2px' }}>
              <strong>Mail:</strong> teamtechneekx@gmail.com
            </div>
          </div>
        </div>

        {/* Page 2 Bottom Footer */}
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '12px',
            textAlign: 'center',
            fontSize: '10.5px',
            color: '#9ca3af',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          TNX CODATHON | TechNeekX | Official Hackathon Finalist NOC
        </div>
      </div>
    </div>
  );
});

NocDocument.displayName = 'NocDocument';
