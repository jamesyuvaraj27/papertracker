import mongoose from 'mongoose';

const presentationScoreItemSchema = new mongoose.Schema({
  parameter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvaluationParameter',
  },
  paramName: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  maxMarks: {
    type: Number,
    default: 10,
  },
  remarks: {
    type: String,
    default: '',
  },
});

const presentationReviewSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    reviewType: {
      type: String,
      required: true,
      enum: ['Review 1', 'Review 2', 'Review 3', 'Final Review'],
      default: 'Review 1',
    },
    panelMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scores: [presentationScoreItemSchema],
    totalMarksObtained: {
      type: Number,
      default: 0,
    },
    totalMaxMarks: {
      type: Number,
      default: 130,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    generalFeedback: {
      type: String,
      default: '',
    },
    recommendation: {
      type: String,
      enum: ['Excellent', 'Good - Minor Changes', 'Satisfactory', 'Needs Significant Improvement'],
      default: 'Good - Minor Changes',
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
presentationReviewSchema.pre('save', function (next) {
  if (this.scores && this.scores.length > 0) {
    this.totalMarksObtained = this.scores.reduce((sum, item) => sum + (Number(item.marks) || 0), 0);
    this.totalMaxMarks = this.scores.reduce((sum, item) => sum + (Number(item.maxMarks) || 10), 0);
    this.percentage = this.totalMaxMarks > 0 
      ? Number(((this.totalMarksObtained / this.totalMaxMarks) * 100).toFixed(2)) 
      : 0;
  }
  next();
});

export default mongoose.model('PresentationReview', presentationReviewSchema);
