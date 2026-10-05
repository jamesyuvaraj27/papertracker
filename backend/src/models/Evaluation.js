import mongoose from 'mongoose';

const paramScoreSchema = new mongoose.Schema({
  parameter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvaluationParameter',
    required: true,
  },
  paramName: {
    type: String,
    required: true,
  },
  category: {
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
  suggestion: {
    type: String,
    default: '',
  },
});

const evaluationSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    scores: [paramScoreSchema],
    totalMarksObtained: {
      type: Number,
      default: 0,
    },
    totalMaxMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    strengths: {
      type: String,
      default: '',
    },
    weaknesses: {
      type: String,
      default: '',
    },
    suggestions: {
      type: String,
      default: '',
    },
    overallVerdict: {
      type: String,
      enum: ['Approved', 'Revision Required', 'Minor Corrections', 'Needs Major Overhaul'],
      default: 'Revision Required',
    },
    status: {
      type: String,
      enum: ['Draft', 'Completed'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
evaluationSchema.pre('save', function (next) {
  if (this.scores && this.scores.length > 0) {
    this.totalMarksObtained = this.scores.reduce((sum, item) => sum + (Number(item.marks) || 0), 0);
    this.totalMaxMarks = this.scores.reduce((sum, item) => sum + (Number(item.maxMarks) || 10), 0);
    this.percentage = this.totalMaxMarks > 0 
      ? Number(((this.totalMarksObtained / this.totalMaxMarks) * 100).toFixed(2)) 
      : 0;
  }
  next();
});

export default mongoose.model('Evaluation', evaluationSchema);
