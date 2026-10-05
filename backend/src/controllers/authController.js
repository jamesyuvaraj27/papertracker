import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'college_paper_tracker_jwt_prod_secret_2026', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated by administrator' });
    }

    // If student/team_leader, find their team info
    let teamInfo = null;
    if (user.role === 'team_leader') {
      teamInfo = await Team.findOne({ leader: user._id })
        .populate('guide', 'name email department designation')
        .lean();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        team: teamInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let teamInfo = null;
    if (user.role === 'team_leader') {
      teamInfo = await Team.findOne({ leader: user._id })
        .populate('guide', 'name email department designation')
        .lean();
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        team: teamInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phoneNumber = req.body.phoneNumber !== undefined ? req.body.phoneNumber : user.phoneNumber;
      user.avatar = req.body.avatar || user.avatar;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          designation: updatedUser.designation,
          phoneNumber: updatedUser.phoneNumber,
          avatar: updatedUser.avatar,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new user (Admin or initial setup)
// @route   POST /api/auth/register
// @access  Public / Admin
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phoneNumber } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'team_leader',
      department: department || 'Computer Science and Engineering',
      designation: designation || (role === 'guide' ? 'Assistant Professor' : 'Student'),
      phoneNumber: phoneNumber || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
