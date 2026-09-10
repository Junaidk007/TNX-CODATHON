import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    clerkId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['member', 'lead', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      default: 'member',
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true,
    },
    organisation: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    courseSpecialization: {
      type: String,
      trim: true,
      default: '',
    },
    courseDuration: {
      type: Number,
      default: null,
    },
    yearOfGraduation: {
      type: Number,
      default: null,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    eventId: {
      type: String,
      default: 'codathon-2026',
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

export const User = mongoose.model('User', userSchema);
