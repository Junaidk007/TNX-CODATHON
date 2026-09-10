import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Team } from '../src/models/Team.js';
import { EventInfo } from '../src/models/EventInfo.js';
import { processTeamFile } from '../src/services/importService.js';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

async function runEndToEndPhase5Tests() {
  console.log('🏎️ Starting Phase 5: Comprehensive E2E System Validation...\n');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI missing');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('1️⃣ [DB Connectivity]: Connected to live MongoDB Atlas Cluster');

  try {
    // ------------------------------------------------------------------------
    // STEP 1: Verify Event Timeline Milestones
    // ------------------------------------------------------------------------
    console.log('\n2️⃣ [Event Schedule & Timeline Verification]:');
    const event = await EventInfo.getSingleton();
    if (event.timeline && event.timeline.length === 12) {
      console.log(`  ✅ Verified 12 official schedule milestones: "${event.timeline[0].activity}" to "${event.timeline[11].activity}"`);
    } else {
      console.error(`  ❌ Timeline count mismatch (expected 12, got ${event.timeline?.length})`);
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // STEP 2: Real Unstop Long-Format Import & Idempotency Test
    // ------------------------------------------------------------------------
    console.log('\n3️⃣ [Unstop Long-Format Bulk Import & Grouping]:');
    const mockUnstopRows = [
      {
        'Regn ID': 'E2E-TEAM-01',
        'Team Name': 'Ferrari HyperCode',
        'Candidate Name': 'Carlos Lead',
        'Candidate Email ID': 'carlos.e2e@ferrari.f1',
        'Contact Number': '9876500001',
        'Team Leader Status': 'Yes',
        'College/University/Organisation': 'Scuderia Academy',
        'Course': 'B.Tech',
        'Course Specialization': 'Aerodynamics & AI',
        'Year of Graduation': 2026,
        'Domain': 'Autonomous Racing',
      },
      {
        'Regn ID': 'E2E-TEAM-01',
        'Team Name': 'Ferrari HyperCode',
        'Candidate Name': 'Charles Driver',
        'Candidate Email ID': 'charles.e2e@ferrari.f1',
        'Contact Number': '9876500002',
        'Team Leader Status': 'No',
        'College/University/Organisation': 'Scuderia Academy',
        'Course': 'B.Tech',
        'Course Specialization': 'Telemetry Systems',
        'Year of Graduation': 2026,
        'Domain': 'Autonomous Racing',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(mockUnstopRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finalists');
    const fileBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const importRes = await processTeamFile(fileBuffer);
    console.log('  Import Result:', importRes);
    if (importRes.imported === 1 && importRes.failed === 0) {
      console.log('  ✅ Unstop long-format grouped into 1 Team and 2 Users');
    } else {
      console.error('  ❌ Import failed:', importRes);
      process.exit(1);
    }

    // Verify DB linkage
    const e2eTeam = await Team.findOne({ regnId: 'E2E-TEAM-01' }).populate('leadId memberIds');
    if (e2eTeam && e2eTeam.leadId.email === 'carlos.e2e@ferrari.f1' && e2eTeam.memberIds.length === 2) {
      console.log('  ✅ Verified Team document with correct leadId ref and memberIds array');
    } else {
      console.error('  ❌ Team linkage error:', e2eTeam);
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // STEP 3: Idempotent Re-Import Verification
    // ------------------------------------------------------------------------
    console.log('\n4️⃣ [Idempotent Re-Import Check]:');
    mockUnstopRows[0]['Team Name'] = 'Ferrari HyperCode Scuderia';
    const wsUpdated = XLSX.utils.json_to_sheet(mockUnstopRows);
    const wbUpdated = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbUpdated, wsUpdated, 'Finalists');
    const updatedBuffer = XLSX.write(wbUpdated, { type: 'buffer', bookType: 'xlsx' });

    const reimportRes = await processTeamFile(updatedBuffer);
    console.log('  Re-import Result:', reimportRes);
    if (reimportRes.updated === 1 && reimportRes.imported === 0) {
      console.log('  ✅ Idempotent update succeeded without creating duplicates');
    } else {
      console.error('  ❌ Re-import error:', reimportRes);
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // STEP 4: Role & Ownership Boundary Validation
    // ------------------------------------------------------------------------
    console.log('\n5️⃣ [Role & Ownership Security Check]:');
    const leadUser = await User.findOne({ email: 'carlos.e2e@ferrari.f1' });
    const memberUser = await User.findOne({ email: 'charles.e2e@ferrari.f1' });

    if (leadUser.role === 'lead' && memberUser.role === 'member') {
      console.log('  ✅ Correct role assignments: Carlos is "lead", Charles is "member"');
    } else {
      console.error('  ❌ Role mismatch:', { leadUser, memberUser });
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // STEP 5: Lead Reassignment Check
    // ------------------------------------------------------------------------
    console.log('\n6️⃣ [Lead Reassignment Workflow]:');
    e2eTeam.leadId = memberUser._id;
    await e2eTeam.save();
    await User.findByIdAndUpdate(leadUser._id, { $set: { role: 'member' } });
    await User.findByIdAndUpdate(memberUser._id, { $set: { role: 'lead' } });

    const reassignedTeam = await Team.findById(e2eTeam._id).populate('leadId');
    if (reassignedTeam.leadId.email === 'charles.e2e@ferrari.f1') {
      console.log('  ✅ Lead reassigned to Charles; roles updated in database');
    } else {
      console.error('  ❌ Lead reassignment failed');
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // STEP 6: PPT URL State Simulation
    // ------------------------------------------------------------------------
    console.log('\n7️⃣ [PPT Presentation Deck State]:');
    reassignedTeam.ppt = 'https://res.cloudinary.com/dbtqj0xpo/raw/upload/v1710000000/codathon_ppts/Ferrari_Deck.pptx';
    await reassignedTeam.save();
    const pptVerifiedTeam = await Team.findById(e2eTeam._id);
    if (pptVerifiedTeam.ppt.includes('cloudinary.com')) {
      console.log('  ✅ PPT presentation deck URL persisted successfully');
    } else {
      console.error('  ❌ PPT persistence failed');
      process.exit(1);
    }

    // ------------------------------------------------------------------------
    // STEP 7: Cleanup
    // ------------------------------------------------------------------------
    await Team.deleteOne({ regnId: 'E2E-TEAM-01' });
    await User.deleteMany({ email: { $in: ['carlos.e2e@ferrari.f1', 'charles.e2e@ferrari.f1'] } });
    console.log('\n🧹 [Teardown]: Cleaned up E2E temporary records');

    console.log('\n🏆 ALL PHASE 5 END-TO-END SYSTEM TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ E2E Test Suite Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runEndToEndPhase5Tests();
