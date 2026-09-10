import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { EventInfo } from '../models/EventInfo.js';

dotenv.config();

const officialTimeline = [
  { time: '9:00 – 9:45 AM', activity: 'Registration & Check-in' },
  { time: '9:45 – 10:00 AM', activity: 'Welcome + Hackathon Briefing' },
  { time: '10:00 – 10:15 AM', activity: 'Problem Statement / Rules / Judging Criteria' },
  { time: '10:15 AM – 1:00 PM', activity: 'Hacking / Development Begins' },
  { time: '11:30 – 11:45 AM', activity: '🎯 Fun Activity 1 — Quick Team Challenge' },
  { time: '1:00 – 2:00 PM', activity: '🍱 Lunch Break' },
  { time: '2:00 – 3:45 PM', activity: 'Hacking / Final Development Sprint' },
  { time: '3:00 – 3:15 PM', activity: '🎮 Fun Activity 2 — Rapid-Fire / Tech Game' },
  { time: '3:45 – 4:00 PM', activity: 'Final Submission + Setup for Demos' },
  { time: '4:00 – 4:40 PM', activity: '🚀 Project Demos / Pitching' },
  { time: '4:40 – 4:55 PM', activity: 'Results + Winners Announcement' },
  { time: '4:55 – 5:00 PM', activity: '🏆 Closing + Group Photo' },
];

async function updateOfficialTimeline() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI missing');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB Atlas');

  try {
    const event = await EventInfo.getSingleton();
    event.timeline = officialTimeline;
    await event.save();

    console.log('🏁 Official Event Timeline successfully updated in MongoDB Atlas!');
    console.log(`Total Milestones: ${event.timeline.length}`);
  } catch (err) {
    console.error('❌ Failed to update timeline:', err);
  } finally {
    await mongoose.disconnect();
  }
}

updateOfficialTimeline();
