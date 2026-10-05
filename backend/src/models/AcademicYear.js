import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AcademicYear', academicYearSchema);
