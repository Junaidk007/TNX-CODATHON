import { 
  updateNameSchema, 
  updateTeamNameSchema, 
  wildcardTeamSchema, 
  reassignLeadSchema, 
  eventInfoSchema 
} from '../src/validators/schemas.js';

async function runSecurityValidationTests() {
  console.log('🧪 Starting Security & Joi Validation Test Suite...\n');

  // Test 1: updateNameSchema validation
  console.log('Testing Candidate Name Joi Validator:');
  const validName = updateNameSchema.validate({ name: 'Alexander Hamilton' });
  if (!validName.error) {
    console.log('  ✅ Valid name passed');
  } else {
    console.error('  ❌ Valid name failed:', validName.error.message);
    process.exit(1);
  }

  const shortName = updateNameSchema.validate({ name: 'A' });
  if (shortName.error) {
    console.log('  ✅ 1-character name correctly rejected (<2 chars)');
  } else {
    console.error('  ❌ 1-character name was allowed');
    process.exit(1);
  }

  const emptyName = updateNameSchema.validate({ name: '   ' });
  if (emptyName.error) {
    console.log('  ✅ Blank name correctly rejected');
  } else {
    console.error('  ❌ Blank name was allowed');
    process.exit(1);
  }

  // Test 2: Wildcard Team Joi Validator (>4 additional members check)
  console.log('\nTesting Wildcard Team Joi Validator:');
  const validWildcard = wildcardTeamSchema.validate({
    teamName: 'Cyber Apex',
    domain: 'AI',
    lead: { name: 'Lewis Lead', email: 'lewis@mercedes.com' },
    members: [
      { name: 'George', email: 'george@mercedes.com' },
      { name: 'Kimi', email: 'kimi@mercedes.com' },
    ],
  });
  if (!validWildcard.error) {
    console.log('  ✅ Valid Wildcard team with 1 lead + 2 members accepted');
  } else {
    console.error('  ❌ Valid Wildcard team failed:', validWildcard.error.message);
    process.exit(1);
  }

  const oversizedWildcard = wildcardTeamSchema.validate({
    teamName: 'Oversized Wildcard',
    lead: { name: 'Lead Driver', email: 'lead@f1.com' },
    members: Array.from({ length: 5 }, (_, i) => ({
      name: `Member ${i + 1}`,
      email: `member${i + 1}@f1.com`,
    })),
  });
  if (oversizedWildcard.error) {
    console.log('  ✅ Wildcard with 5 additional members correctly rejected (exceeds max 4 extra)');
  } else {
    console.error('  ❌ Oversized Wildcard was permitted');
    process.exit(1);
  }

  const invalidEmailWildcard = wildcardTeamSchema.validate({
    teamName: 'Bad Email Team',
    lead: { name: 'Lead Driver', email: 'not-an-email' },
  });
  if (invalidEmailWildcard.error) {
    console.log('  ✅ Malformed lead email correctly rejected by Joi');
  } else {
    console.error('  ❌ Malformed email was accepted');
    process.exit(1);
  }

  // Test 3: Lead Reassignment Joi Validator (ObjectId check)
  console.log('\nTesting Lead Reassignment Hex ObjectId Joi Validator:');
  const validObjectId = reassignLeadSchema.validate({
    newLeadId: '507f1f77bcf86cd799439011',
  });
  if (!validObjectId.error) {
    console.log('  ✅ Valid 24-character hexadecimal ObjectId accepted');
  } else {
    console.error('  ❌ Valid ObjectId failed:', validObjectId.error.message);
    process.exit(1);
  }

  const invalidObjectId = reassignLeadSchema.validate({
    newLeadId: 'not-a-valid-id-123',
  });
  if (invalidObjectId.error) {
    console.log('  ✅ Malformed ObjectId correctly rejected');
  } else {
    console.error('  ❌ Malformed ObjectId was accepted');
    process.exit(1);
  }

  // Test 4: Event Info Joi Validator
  console.log('\nTesting Event Info Joi Validator:');
  const validEvent = eventInfoSchema.validate({
    timeline: [{ time: '10:00 AM', activity: 'Track Release' }],
    prizePool: '500k INR',
    location: 'Circuit Arena',
  });
  if (!validEvent.error) {
    console.log('  ✅ Valid Event Info schema accepted');
  } else {
    console.error('  ❌ Valid Event Info schema failed:', validEvent.error.message);
    process.exit(1);
  }

  console.log('\n🎉 All Security & Joi Validation Tests Passed Successfully!');
}

runSecurityValidationTests();
