import mongoose from 'mongoose';

const evaluationParameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Research Quality',
        'Writing Quality',
        'Technical Quality',
        'Conference Readiness',
        'Presentation Review'
      ],
    },
    description: {
      type: String,
      default: '',
    },
    maxMarks: {
      type: Number,
      default: 10,
    },
    isPresentation: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('EvaluationParameter', evaluationParameterSchema);
