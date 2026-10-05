import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    versionLabel: {
      type: String,
      default: 'V1',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    abstract: {
      type: String,
      default: '',
    },
    keywords: [{
      type: String,
      trim: true,
    }],
    submissionType: {
      type: String,
      enum: ['file', 'link', 'both'],
      default: 'file',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    externalLink: {
      type: String,
      default: '',
    },
    changelog: {
      type: String,
      default: 'Initial paper submission',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Revision Required', 'Approved'],
      default: 'Submitted',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Format version label automatically
submissionSchema.pre('save', function (next) {
  if (this.version) {
    this.versionLabel = `V${this.version}`;
  }
  next();
});

export default mongoose.model('Submission', submissionSchema);
