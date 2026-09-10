import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Team } from '../src/models/Team.js';
import { EventInfo } from '../src/models/EventInfo.js';

async function runModelTests() {
  console.log('🧪 Starting Mongoose Model Schema Validation Tests...');

  // Test 1: User Schema Validation without DB connection
  const invalidUser = new User({});
  const userValidationErr = invalidUser.validateSync();
  if (userValidationErr && userValidationErr.errors['name'] && userValidationErr.errors['email']) {
    console.log('✅ User schema correctly requires name and email.');
  } else {
    console.error('❌ User schema failed required validation checks.');
    process.exit(1);
  }

  // Test 2: User Role Enum Validation
  const invalidRoleUser = new User({ name: 'Test', email: 'test@example.com', role: 'judge' });
  const roleErr = invalidRoleUser.validateSync();
  if (roleErr && roleErr.errors['role']) {
    console.log('✅ User schema correctly rejects non-permitted roles (e.g., judge).');
  } else {
    console.error('❌ User schema permitted invalid role.');
    process.exit(1);
  }

  // Test 3: Team Schema Max 5 Members Validation
  const validLeadId = new mongoose.Types.ObjectId();
  const sixMembers = Array.from({ length: 6 }, () => new mongoose.Types.ObjectId());
  const oversizedTeam = new Team({
    teamName: 'Overloaded Team',
    regnId: 'REG-100',
    leadId: validLeadId,
    memberIds: sixMembers,
  });

  const teamErr = oversizedTeam.validateSync();
  if (teamErr && teamErr.errors['memberIds']) {
    console.log('✅ Team schema correctly rejects >5 members (max 5 constraint).');
  } else {
    console.error('❌ Team schema failed to enforce max 5 members.');
    process.exit(1);
  }

  // Test 4: Team Schema Valid 5 Members
  const fiveMembers = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());
  const validTeam = new Team({
    teamName: 'Valid Team',
    regnId: 'REG-200',
    leadId: validLeadId,
    memberIds: fiveMembers,
  });
  const validTeamErr = validTeam.validateSync();
  if (!validTeamErr) {
    console.log('✅ Team schema correctly accepts valid team with 5 members.');
  } else {
    console.error('❌ Team schema errored on valid team:', validTeamErr.message);
    process.exit(1);
  }

  // Test 5: EventInfo Schema Structure
  const event = new EventInfo({
    timeline: [{ time: '10:00 AM', activity: 'Kickoff' }],
    prizePool: '100,000 INR',
    location: 'Auditorium',
  });
  const eventErr = event.validateSync();
  if (!eventErr) {
    console.log('✅ EventInfo schema validates correctly.');
  } else {
    console.error('❌ EventInfo schema validation error:', eventErr.message);
    process.exit(1);
  }

  console.log('🎉 All Model Schema Validation Tests Passed Successfully!');
}

runModelTests();
