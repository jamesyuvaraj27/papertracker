import User from '../models/User.js';
import Team from '../models/Team.js';

// @desc    Get all guides
// @route   GET /api/users/guides
// @access  Private
export const getGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: 'guide' }).select('-password').lean();
    
    // Attach assigned teams count
    const guidesWithStats = await Promise.all(
      guides.map(async (guide) => {
        const assignedTeams = await Team.find({ guide: guide._id }).select('teamName projectTitle academicYear status');
        return {
          ...guide,
          assignedTeamsCount: assignedTeams.length,
          assignedTeams,
        };
      })
    );

    res.json({ success: true, data: guidesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students / team leaders
// @route   GET /api/users/students
// @access  Private
export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'team_leader' }).select('-password').lean();
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Guide (Admin)
// @route   POST /api/users/guides
// @access  Private/Admin
export const createGuide = async (req, res) => {
  try {
    const { name, email, password, department, designation, phoneNumber } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Initial password is required for guide account creation' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const guide = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'guide',
      department: department || 'Computer Science and Engineering',
      designation: designation || 'Assistant Professor',
      phoneNumber: phoneNumber || '',
    });

    res.status(201).json({
      success: true,
      message: 'Guide created successfully',
      data: {
        _id: guide._id,
        name: guide.name,
        email: guide.email,
        role: guide.role,
        department: guide.department,
        designation: guide.designation,
        phoneNumber: guide.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Guide (Admin)
// @route   PUT /api/users/guides/:id
// @access  Private/Admin
export const updateGuide = async (req, res) => {
  try {
    const guide = await User.findById(req.params.id);
    if (!guide || guide.role !== 'guide') {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    guide.name = req.body.name || guide.name;
    guide.department = req.body.department || guide.department;
    guide.designation = req.body.designation || guide.designation;
    guide.phoneNumber = req.body.phoneNumber !== undefined ? req.body.phoneNumber : guide.phoneNumber;
    if (req.body.isActive !== undefined) {
      guide.isActive = req.body.isActive;
    }

    const updated = await guide.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status / deactivate
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
