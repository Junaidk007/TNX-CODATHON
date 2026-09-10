import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    regnId: {
      type: String,
      required: [true, 'Registration ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead ID is required'],
      index: true,
    },
    memberIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: [
        {
          validator: function (members) {
            return members.length <= 5;
          },
          message: 'A team cannot have more than 5 members (including the lead).',
        },
        {
          validator: function (members) {
            return members.length >= 1;
          },
          message: 'A team must have at least 1 member (the lead).',
        },
      ],
    },
    ppt: {
      type: String,
      default: null,
    },
    createdVia: {
      type: String,
      enum: {
        values: ['preload', 'wildcard'],
        message: '{VALUE} is not a valid creation source',
      },
      default: 'preload',
    },
    domain: {
      type: String,
      trim: true,
      default: '',
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

export const Team = mongoose.model('Team', teamSchema);
