import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import { processTeamFile } from '../src/services/importService.js';
import { User } from '../src/models/User.js';
import { Team } from '../src/models/Team.js';
import dotenv from 'dotenv';

dotenv.config();

async function runImportTests() {
  console.log('🧪 Starting Excel/CSV Import & Grouping Test Suite...');

  // Connect to test MongoDB if URI available, or use in-memory/mock check
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI found for live integration test.');
    return;
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB for Import Tests');

  try {
    // 1. Create a simulated Unstop long-format Excel sheet in memory
    const testRows = [
      // Team 1 (3 members, Leader = Alice)
      {
        'Regn ID': 'TEST-REG-01',
        'Team Name': 'Alpha Coders',
        'Candidate Name': 'Alice Lead',
        'Candidate Email ID': 'alice.test@example.com',
        'Contact Number': '9876543210',
        'Team Leader Status': 'Yes',
        'College/University/Organisation': 'Tech Institute',
        'Course': 'B.Tech',
        'Course Specialization': 'CSE',
        'Course Duration': 4,
        'Year of Graduation': 2026,
        'City': 'Bengaluru',
        'Domain': 'AI / ML',
      },
      {
        'Regn ID': 'TEST-REG-01',
        'Team Name': 'Alpha Coders',
        'Candidate Name': 'Bob Member',
        'Candidate Email ID': 'bob.test@example.com',
        'Contact Number': '9876543211',
        'Team Leader Status': 'No',
        'College/University/Organisation': 'Tech Institute',
        'Course': 'B.Tech',
        'Course Specialization': 'CSE',
        'Course Duration': 4,
        'Year of Graduation': 2026,
        'City': 'Bengaluru',
        'Domain': 'AI / ML',
      },
      {
        'Regn ID': 'TEST-REG-01',
        'Team Name': 'Alpha Coders',
        'Candidate Name': 'Charlie Member',
        'Candidate Email ID': 'charlie.test@example.com',
        'Contact Number': '9876543212',
        'Team Leader Status': 'No',
        'College/University/Organisation': 'Tech Institute',
        'Course': 'B.Tech',
        'Course Specialization': 'CSE',
        'Course Duration': 4,
        'Year of Graduation': 2026,
        'City': 'Bengaluru',
        'Domain': 'AI / ML',
      },

      // Team 2 (6 members - Should FAIL validation >5)
      ...Array.from({ length: 6 }, (_, i) => ({
        'Regn ID': 'TEST-REG-OVERSIZED',
        'Team Name': 'Oversized Six',
        'Candidate Name': `Member ${i + 1}`,
        'Candidate Email ID': `member${i + 1}.oversized@example.com`,
        'Contact Number': `987654322${i}`,
        'Team Leader Status': i === 0 ? 'Yes' : 'No',
        'College/University/Organisation': 'Tech Institute',
      })),
    ];

    // Generate workbook buffer
    const ws = XLSX.utils.json_to_sheet(testRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finalists');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 2. Execute Import
    console.log('🔄 Executing processTeamFile on sample dataset...');
    const result = await processTeamFile(buffer, 'test-event');

    console.log('📊 First Import Result:', result);

    if (result.imported === 1 && result.failed === 1 && result.errors.length === 1) {
      console.log('✅ Import correctly imported valid team and rejected >5 member oversized team.');
    } else {
      console.error('❌ Unexpected import results:', result);
      process.exit(1);
    }

    // Verify DB records
    const createdTeam = await Team.findOne({ regnId: 'TEST-REG-01' }).populate('leadId memberIds');
    if (createdTeam && createdTeam.memberIds.length === 3 && createdTeam.leadId.email === 'alice.test@example.com') {
      console.log('✅ Database verification: Team created with 3 members, correct leader assigned.');
    } else {
      console.error('❌ Database state mismatch:', createdTeam);
      process.exit(1);
    }

    // 3. Test Idempotent Re-Import (Modify Team Name to 'Alpha Coders Renamed')
    testRows[0]['Team Name'] = 'Alpha Coders Renamed';
    const ws2 = XLSX.utils.json_to_sheet(testRows.slice(0, 3)); // Only the valid team
    const wb2 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb2, ws2, 'Finalists');
    const buffer2 = XLSX.write(wb2, { type: 'buffer', bookType: 'xlsx' });

    console.log('🔄 Executing re-import with updated team name...');
    const reimportResult = await processTeamFile(buffer2, 'test-event');
    console.log('📊 Re-import Result:', reimportResult);

    if (reimportResult.updated === 1 && reimportResult.imported === 0) {
      console.log('✅ Idempotent re-import verified: existing team updated on regnId match!');
    } else {
      console.error('❌ Re-import did not update existing team:', reimportResult);
      process.exit(1);
    }

    // Cleanup test data
    await Team.deleteMany({ regnId: { $in: ['TEST-REG-01', 'TEST-REG-OVERSIZED'] } });
    await User.deleteMany({ email: { $in: ['alice.test@example.com', 'bob.test@example.com', 'charlie.test@example.com'] } });
    console.log('🧹 Cleaned up test data from MongoDB.');

    console.log('🎉 All Import Service Tests Passed Successfully!');
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runImportTests();
