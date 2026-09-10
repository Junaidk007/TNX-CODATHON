import mongoose from 'mongoose';
import { Team } from '../src/models/Team.js';
import { User } from '../src/models/User.js';
import { EventInfo } from '../src/models/EventInfo.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTeamTests() {
  console.log('🧪 Starting Team Management & Admin Control Tests...');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI found.');
    return;
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB for Team Tests');

  try {
    // 1. Create a test team with 2 users (Alice: lead, Bob: member)
    const alice = await User.create({
      name: 'Alice Pioneer',
      email: 'alice.lead@example.com',
      role: 'lead',
    });

    const bob = await User.create({
      name: 'Bob Velocity',
      email: 'bob.member@example.com',
      role: 'member',
    });

    const team = await Team.create({
      teamName: 'Apex Racing Team',
      regnId: 'TEST-APEX-01',
      leadId: alice._id,
      memberIds: [alice._id, bob._id],
      domain: 'Autonomous Systems',
    });

    alice.teamId = team._id;
    await alice.save();
    bob.teamId = team._id;
    await bob.save();

    console.log('✅ Created test team with Alice as Lead and Bob as Member.');

    // 2. Test Lead Reassignment: Reassign lead to Bob
    team.leadId = bob._id;
    await team.save();

    await User.findByIdAndUpdate(alice._id, { $set: { role: 'member' } });
    await User.findByIdAndUpdate(bob._id, { $set: { role: 'lead' } });

    const verifiedTeam = await Team.findById(team._id).populate('leadId');
    const updatedAlice = await User.findById(alice._id);
    const updatedBob = await User.findById(bob._id);

    if (
      verifiedTeam.leadId._id.equals(bob._id) &&
      updatedBob.role === 'lead' &&
      updatedAlice.role === 'member'
    ) {
      console.log('✅ Lead reassignment verified: Bob is now Lead, Alice is now Member.');
    } else {
      console.error('❌ Lead reassignment failed:', { verifiedTeam, updatedBob, updatedAlice });
      process.exit(1);
    }

    // 3. Test EventInfo Singleton update
    const event = await EventInfo.getSingleton();
    event.prizePool = '500,000 INR Championship Pool';
    event.location = 'F1 Circuit Innovation Tech Hub';
    await event.save();

    const verifiedEvent = await EventInfo.getSingleton();
    if (
      verifiedEvent.prizePool === '500,000 INR Championship Pool' &&
      verifiedEvent.location === 'F1 Circuit Innovation Tech Hub'
    ) {
      console.log('✅ EventInfo singleton modification verified.');
    } else {
      console.error('❌ EventInfo modification failed:', verifiedEvent);
      process.exit(1);
    }

    // Clean up test data
    await Team.deleteOne({ _id: team._id });
    await User.deleteMany({ _id: { $in: [alice._id, bob._id] } });
    console.log('🧹 Cleaned up team test data.');

    console.log('🎉 All Team & Event Management Tests Passed Successfully!');
  } catch (error) {
    console.error('❌ Team Test Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTeamTests();
