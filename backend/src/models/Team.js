import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    default: 'Computer Science and Engineering',
  },
});

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2026-2027',
    },
    department: {
      type: String,
      default: 'Computer Science and Engineering',
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guide is required'],
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Team leader is required'],
    },
    members: [memberSchema],
    domain: {
      type: String,
      default: 'Artificial Intelligence & Machine Learning',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Team', teamSchema);
