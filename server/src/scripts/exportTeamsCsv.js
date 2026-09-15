import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function exportCsv() {
  await mongoose.connect(process.env.MONGODB_URI);
  const teams = await Team.find().populate('leadId').lean();

  const refImageTeams = [
    {
      teamId: 'TNX-101',
      teamName: 'Navdrishti',
      teamLeader: 'Harsh Kumar Singh',
      projectTitle: 'KrishiMitra AI',
      college: 'Shri Ramswaroop Memorial College Of Engineering And Management',
    },
    {
      teamId: 'TNX-102',
      teamName: 'Excalibur',
      teamLeader: 'Maaz Ahmad Khan',
      projectTitle: 'Skillconnect AI',
      college: 'SRMCEM',
    },
    {
      teamId: 'TNX-103',
      teamName: 'LOCALHOSTS',
      teamLeader: 'Jai Pratap Singh',
      projectTitle: 'Aegis',
      college: 'SRMCEM Lucknow',
    },
    {
      teamId: 'TNX-104',
      teamName: 'Tech_Lababdar',
      teamLeader: 'Tanu Mishra',
      projectTitle: 'TESSA - Training Education System for Skill Advancement',
      college: 'SRMCEM',
    },
    {
      teamId: 'TNX-105',
      teamName: 'HackHers',
      teamLeader: 'Achint Kaur',
      projectTitle: 'FasalDrishti',
      college: 'Shri Ramswaroop Memorial College of Engineering and Management',
    },
  ];

  const rows = [];
  // Column header strictly as requested: [Team id, team name, team leader, project title, collage]
  rows.push(['Team id', 'team name', 'team leader', 'project title', 'collage'].join(','));

  // 1. Teams present in the database
  for (const t of teams) {
    const teamId = t.regnId || String(t._id);
    const teamName = t.teamName || '';
    const teamLeader = t.leadId ? t.leadId.name : '';
    const projectTitle = '';
    const college = t.leadId ? t.leadId.organisation : '';

    rows.push([
      escapeCsv(teamId),
      escapeCsv(teamName),
      escapeCsv(teamLeader),
      escapeCsv(projectTitle),
      escapeCsv(college),
    ].join(','));
  }

  // 2. Reference image teams
  for (const r of refImageTeams) {
    rows.push([
      escapeCsv(r.teamId),
      escapeCsv(r.teamName),
      escapeCsv(r.teamLeader),
      escapeCsv(r.projectTitle),
      escapeCsv(r.college),
    ].join(','));
  }

  const csvContent = rows.join('\r\n');
  const targetPath = path.resolve(__dirname, '../../../teams.csv');
  fs.writeFileSync(targetPath, csvContent, 'utf-8');
  console.log(`Successfully generated ${targetPath} with ${rows.length - 1} teams (${teams.length} from DB + ${refImageTeams.length} from reference image).`);

  await mongoose.disconnect();
}

exportCsv().catch((err) => {
  console.error('Error generating CSV:', err);
  process.exit(1);
});
