import Team from '../models/Team.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import PresentationReview from '../models/PresentationReview.js';

// @desc    Get teams (Admin sees all, Guide sees assigned, Student sees own)
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req, res) => {
  try {
    let query = {};
    const { academicYear, department, search } = req.query;

    if (req.user.role === 'guide') {
      query.guide = req.user._id;
    } else if (req.user.role === 'team_leader') {
      query.leader = req.user._id;
    }

    if (academicYear) query.academicYear = academicYear;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const teams = await Team.find(query)
      .populate('guide', 'name email department designation phoneNumber')
      .populate('leader', 'name email department phoneNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Attach latest submission and evaluation summary for each team
    const enrichedTeams = await Promise.all(
      teams.map(async (team) => {
        const submissions = await Submission.find({ team: team._id }).sort({ version: -1 }).lean();
        const latestSubmission = submissions[0] || null;
        
        let latestEvaluation = null;
        if (latestSubmission) {
          latestEvaluation = await Evaluation.findOne({ submission: latestSubmission._id }).lean();
        }

        const presentationReviews = await PresentationReview.find({ team: team._id }).lean();
        const avgPresentationScore = presentationReviews.length > 0
          ? Number((presentationReviews.reduce((sum, r) => sum + r.percentage, 0) / presentationReviews.length).toFixed(1))
          : null;

        const paperScore = latestEvaluation ? latestEvaluation.percentage : (submissions.length > 0 ? 0 : null);
        
        let finalScore = null;
        if (paperScore !== null && avgPresentationScore !== null) {
          finalScore = Number(((paperScore * 0.7) + (avgPresentationScore * 0.3)).toFixed(1));
        } else if (paperScore !== null) {
          finalScore = Number((paperScore * 0.7).toFixed(1));
        }

        return {
          ...team,
          submissionCount: submissions.length,
          latestVersion: latestSubmission ? latestSubmission.versionLabel : 'None',
          latestSubmissionStatus: latestSubmission ? latestSubmission.status : 'No Submissions',
          paperScore,
          presentationScore: avgPresentationScore,
          finalScore,
          submissions,
        };
      })
    );

    res.json({ success: true, count: enrichedTeams.length, data: enrichedTeams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('guide', 'name email department designation phoneNumber')
      .populate('leader', 'name email department phoneNumber');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const submissions = await Submission.find({ team: team._id }).sort({ version: -1 }).lean();
    const presentationReviews = await PresentationReview.find({ team: team._id }).lean();

    res.json({
      success: true,
      data: {
        ...team.toObject(),
        submissions,
        presentationReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new Team (Admin)
// @route   POST /api/teams
// @access  Private/Admin
export const createTeam = async (req, res) => {
  try {
    const {
      teamName,
      projectTitle,
      academicYear,
      department,
      guideId,
      leaderName,
      leaderEmail,
      leaderPassword,
      members,
      domain,
    } = req.body;

    // Verify or create leader user
    let leader = await User.findOne({ email: leaderEmail.toLowerCase() });
    if (!leader) {
      if (!leaderPassword) {
        return res.status(400).json({ success: false, message: 'Initial password is required to create a new team leader account' });
      }
      leader = await User.create({
        name: leaderName,
        email: leaderEmail.toLowerCase(),
        password: leaderPassword,
        role: 'team_leader',
        department: department || 'Computer Science and Engineering',
        designation: 'Team Leader',
      });
    }

    const guide = await User.findById(guideId);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Selected Guide not found' });
    }

    const newTeam = await Team.create({
      teamName,
      projectTitle,
      academicYear: academicYear || '2026-2027',
      department: department || 'Computer Science and Engineering',
      guide: guide._id,
      leader: leader._id,
      members: members || [],
      domain: domain || 'Artificial Intelligence & Machine Learning',
    });

    const populatedTeam = await Team.findById(newTeam._id)
      .populate('guide', 'name email department designation')
      .populate('leader', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: populatedTeam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Team (Admin / Guide)
// @route   PUT /api/teams/:id
// @access  Private
export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (req.body.teamName) team.teamName = req.body.teamName;
    if (req.body.projectTitle) team.projectTitle = req.body.projectTitle;
    if (req.body.academicYear) team.academicYear = req.body.academicYear;
    if (req.body.department) team.department = req.body.department;
    if (req.body.domain) team.domain = req.body.domain;
    if (req.body.status) team.status = req.body.status;
    if (req.body.guideId) team.guide = req.body.guideId;
    if (req.body.members) team.members = req.body.members;

    const updated = await team.save();
    res.json({ success: true, message: 'Team updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Team (Admin)
// @route   DELETE /api/teams/:id
// @access  Private/Admin
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    await Submission.deleteMany({ team: team._id });
    await Evaluation.deleteMany({ team: team._id });
    await PresentationReview.deleteMany({ team: team._id });
    await team.deleteOne();

    res.json({ success: true, message: 'Team and associated records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
