import * as XLSX from 'xlsx';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function processTeamFile(fileBuffer, eventId = 'codathon-2026') {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded file contains no data rows.');
  }

  // 1. Normalize and Group rows by Regn ID
  const groupsByRegnId = new Map();

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const normalized = {};
    for (const [key, value] of Object.entries(raw)) {
      const cleanKey = key
        .toLowerCase()
        .trim()
        .replace(/'/g, '')
        .replace(/[^a-z0-9]/g, '');

      if (['regnid', 'registrationid', 'regid', 'teamid'].includes(cleanKey)) {
        normalized.regnId = String(value || '').trim();
      } else if (['teamname', 'team', 'teamnamecandidatename'].includes(cleanKey)) {
        normalized.teamName = String(value || '').trim();
      } else if (['candidatesname', 'candidatename', 'name', 'fullname', 'participantname'].includes(cleanKey)) {
        normalized.name = String(value || '').trim();
      } else if (['candidatesemail', 'candidateemail', 'candidateemailid', 'emailid', 'email', 'emailaddress'].includes(cleanKey)) {
        normalized.email = String(value || '').toLowerCase().trim();
      } else if (['teamleadersemailcandidatesemail', 'leaderemail', 'teamleaderemail'].includes(cleanKey)) {
        normalized.fallbackEmail = String(value || '').toLowerCase().trim();
      } else if (['contactnumber', 'mobile', 'phone', 'candidatesmobile', 'candidatemobile', 'mobilenumber', 'phonenumber'].includes(cleanKey)) {
        normalized.mobile = String(value || '').trim();
      } else if (['teamleaderstatus', 'teamleader', 'isleader', 'role', 'lead', 'candidatetype'].includes(cleanKey)) {
        const v = String(value || '').toLowerCase().trim();
        normalized.isLeader = ['yes', '1', 'true', 'leader', 'lead', 'team leader'].includes(v);
      } else if ([
        'collegeuniversityorganisation',
        'collegeuniversityorganization',
        'candidatesorganisation',
        'candidatesorganization',
        'college',
        'organisation',
        'institution',
        'organization',
      ].includes(cleanKey)) {
        normalized.organisation = String(value || '').trim();
      } else if (['course', 'degree'].includes(cleanKey)) {
        normalized.course = String(value || '').trim();
      } else if (['coursespecialization', 'branch', 'specialization'].includes(cleanKey)) {
        normalized.courseSpecialization = String(value || '').trim();
      } else if (['coursedurationyears', 'courseduration', 'duration'].includes(cleanKey)) {
        normalized.courseDuration = Number(value) || null;
      } else if (['yearofgraduation', 'graduationyear', 'passingyear'].includes(cleanKey)) {
        normalized.yearOfGraduation = Number(value) || null;
      } else if (['candidateslocation', 'city', 'location'].includes(cleanKey)) {
        normalized.location = String(value || '').trim();
      } else if (['domain', 'track', 'category'].includes(cleanKey)) {
        normalized.domain = String(value || '').trim();
      } else if (['reporturl', 'reportlink', 'url'].includes(cleanKey)) {
        normalized.reportUrl = String(value || '').trim();
      }
    }

    if (!normalized.email && normalized.fallbackEmail) {
      normalized.email = normalized.fallbackEmail;
    }

    if (!normalized.regnId) continue;

    if (!groupsByRegnId.has(normalized.regnId)) {
      groupsByRegnId.set(normalized.regnId, []);
    }
    groupsByRegnId.get(normalized.regnId).push({
      ...normalized,
      _rowNumber: i + 2,
    });
  }

  let imported = 0;
  let updated = 0;
  let failed = 0;
  const errors = [];

  for (const [regnId, members] of groupsByRegnId.entries()) {
    try {
      if (members.length > 5) {
        failed++;
        errors.push({
          teamRegnId: regnId,
          reason: `Team has ${members.length} members. Maximum allowed is 5.`,
        });
        continue;
      }

      if (members.length === 0) {
        failed++;
        errors.push({
          teamRegnId: regnId,
          reason: 'Team has no valid member records.',
        });
        continue;
      }

      const invalidMember = members.find(
        (m) => !m.email || !isValidEmail(m.email) || !m.name
      );
      if (invalidMember) {
        failed++;
        errors.push({
          teamRegnId: regnId,
          reason: `Invalid or missing email/name for candidate '${invalidMember.name || 'Unknown'}' on row ${invalidMember._rowNumber}.`,
        });
        continue;
      }

      const teamName = members[0].teamName || `Team ${regnId}`;
      const domain = members.find((m) => m.domain)?.domain || '';

      const existingTeam = await Team.findOne({ regnId, eventId });
      const isUpdate = !!existingTeam;

      let leadIndex = members.findIndex((m) => m.isLeader);
      if (leadIndex === -1) leadIndex = 0;

      // Check for email collision across other teams in a single batch query
      const memberEmails = members.map((m) => m.email);
      const conflictingUsers = await User.find({
        email: { $in: memberEmails },
        teamId: { $ne: null },
      });
      const conflict = conflictingUsers.find(
        (u) => !existingTeam || !u.teamId.equals(existingTeam._id)
      );
      if (conflict) {
        failed++;
        errors.push({
          teamRegnId: regnId,
          reason: `Email '${conflict.email}' is already assigned to another team.`,
        });
        continue;
      }

      // Parallelize member upserts for this team
      const memberUserDocs = await Promise.all(
        members.map((m, idx) => {
          const isThisLead = idx === leadIndex;
          const role = isThisLead ? 'lead' : 'member';
          const userPayload = {
            name: m.name,
            email: m.email,
            mobile: m.mobile || '',
            location: m.location || '',
            role,
            organisation: m.organisation || '',
            course: m.course || '',
            courseSpecialization: m.courseSpecialization || '',
            courseDuration: m.courseDuration,
            yearOfGraduation: m.yearOfGraduation,
            eventId,
          };
          return User.findOneAndUpdate(
            { email: m.email },
            { $set: userPayload },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
        })
      );

      const memberUserIds = memberUserDocs.map((u) => u._id);
      const leadUserId = memberUserDocs[leadIndex]._id;

      if (existingTeam) {
        existingTeam.teamName = teamName;
        existingTeam.domain = domain;
        existingTeam.leadId = leadUserId;
        existingTeam.memberIds = memberUserIds;
        await existingTeam.save();

        await User.updateMany(
          { _id: { $in: memberUserIds } },
          { $set: { teamId: existingTeam._id } }
        );
        updated++;
      } else {
        const newTeam = await Team.create({
          teamName,
          regnId,
          leadId: leadUserId,
          memberIds: memberUserIds,
          createdVia: 'preload',
          domain,
          eventId,
        });

        await User.updateMany(
          { _id: { $in: memberUserIds } },
          { $set: { teamId: newTeam._id } }
        );
        imported++;
      }
    } catch (teamErr) {
      console.error(`Error processing team ${regnId}:`, teamErr);
      failed++;
      errors.push({
        teamRegnId: regnId,
        reason: teamErr.message || 'Internal error saving team data.',
      });
    }
  }

  return {
    imported,
    updated,
    failed,
    totalTeamsInFile: groupsByRegnId.size,
    errors,
  };
}
