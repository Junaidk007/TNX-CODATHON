import mongoose from 'mongoose';

const timelineItemSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true,
    },
    activity: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const eventInfoSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      default: 'tnx-codathon-2026',
      unique: true,
      index: true,
    },
    timeline: {
      type: [timelineItemSchema],
      default: [],
    },
    prizePool: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: 'Lucknow, UP, India',
      trim: true,
    },
    venue: {
      type: String,
      default: 'Shri Ramswaroop Memorial College of Engineering and Management (SRMCEM)',
      trim: true,
    },
    eventDates: {
      type: String,
      default: '16 September 2026',
      trim: true,
    },
    eventFormat: {
      type: String,
      default: 'Offline Hackathon',
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Official default schedule
const defaultOfficialTimeline = [
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

// Helper for singleton behavior
eventInfoSchema.statics.getSingleton = async function (eventId = 'tnx-codathon-2026') {
  let event = await this.findOne({ eventId });
  if (!event) {
    event = await this.create({
      eventId,
      timeline: defaultOfficialTimeline,
      prizePool: '500,000 INR Championship Pool + Direct Placement Opportunities',
      location: 'TechNeekX Innovation Hub, Campus Arena',
    });
  }
  return event;
};

export const EventInfo = mongoose.model('EventInfo', eventInfoSchema);
