import AcademicYear from '../models/AcademicYear.js';

// @desc    Get all academic years
// @route   GET /api/academic-years
// @access  Private
export const getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ year: -1 });
    res.json({ success: true, count: years.length, data: years });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new academic year
// @route   POST /api/academic-years
// @access  Private/Admin
export const createAcademicYear = async (req, res) => {
  try {
    const { year, label, isActive } = req.body;

    const existing = await AcademicYear.findOne({ year });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Academic Year already exists' });
    }

    if (isActive) {
      await AcademicYear.updateMany({}, { isActive: false });
    }

    const newYear = await AcademicYear.create({
      year,
      label: label || `Academic Session ${year}`,
      isActive: isActive !== undefined ? isActive : false,
    });

    res.status(201).json({ success: true, data: newYear });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
