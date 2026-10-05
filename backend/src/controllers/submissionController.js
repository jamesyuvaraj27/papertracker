import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';

// @desc    Get submissions (Filtered by Team or Guide)
// @route   GET /api/submissions
// @access  Private
export const getSubmissions = async (req, res) => {
  try {
    const { teamId, status } = req.query;
    let query = {};

    if (teamId) {
      query.team = teamId;
    } else if (req.user.role === 'team_leader') {
      const myTeam = await Team.findOne({ leader: req.user._id });
      if (myTeam) {
        query.team = myTeam._id;
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    } else if (req.user.role === 'guide') {
      const myTeams = await Team.find({ guide: req.user._id }).select('_id');
      const teamIds = myTeams.map((t) => t._id);
      query.team = { $in: teamIds };
    }

    if (status) {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate({
        path: 'team',
        populate: [
          { path: 'guide', select: 'name email department designation' },
          { path: 'leader', select: 'name email' },
        ],
      })
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single submission by ID
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'team',
        populate: [
          { path: 'guide', select: 'name email department designation phoneNumber' },
          { path: 'leader', select: 'name email department phoneNumber' },
        ],
      })
      .populate('submittedBy', 'name email role');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload / Create paper submission (with auto versioning V1, V2...)
// @route   POST /api/submissions
// @access  Private
export const createSubmission = async (req, res) => {
  try {
    let { teamId, title, abstract, keywords, submissionType, externalLink, changelog } = req.body;

    let team;
    if (req.user.role === 'team_leader') {
      team = await Team.findOne({ leader: req.user._id });
    } else {
      team = await Team.findById(teamId);
    }

    if (!team) {
      return res.status(404).json({ success: false, message: 'Associated team not found' });
    }

    // Determine the next version number
    const lastSubmission = await Submission.findOne({ team: team._id }).sort({ version: -1 });
    const nextVersion = lastSubmission ? lastSubmission.version + 1 : 1;

    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    if (!fileUrl && !externalLink) {
      return res.status(400).json({ success: false, message: 'Please upload a paper file or provide a valid submission URL' });
    }

    let parsedKeywords = [];
    if (keywords) {
      parsedKeywords = typeof keywords === 'string' ? keywords.split(',').map((k) => k.trim()) : keywords;
    }

    const submission = await Submission.create({
      team: team._id,
      version: nextVersion,
      versionLabel: `V${nextVersion}`,
      title: title || team.projectTitle,
      abstract: abstract || '',
      keywords: parsedKeywords,
      submissionType: submissionType || (fileUrl && externalLink ? 'both' : fileUrl ? 'file' : 'link'),
      fileUrl,
      fileName,
      fileSize,
      externalLink: externalLink || '',
      changelog: changelog || (nextVersion === 1 ? 'Initial paper draft submission' : `Version ${nextVersion} revision update`),
      status: 'Submitted',
      submittedBy: req.user._id,
      submittedAt: new Date(),
    });

    // Notify Guide
    await Notification.create({
      recipient: team.guide,
      sender: req.user._id,
      title: `New Paper Submission (${submission.versionLabel})`,
      message: `Team "${team.teamName}" uploaded ${submission.versionLabel} for project: ${team.projectTitle}`,
      type: 'submission',
      link: `/guide/evaluations/${submission._id}`,
    });

    const populated = await Submission.findById(submission._id)
      .populate('team')
      .populate('submittedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Paper version ${submission.versionLabel} submitted successfully!`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update submission status (e.g. Under Review, Approved, Revision Required)
// @route   PATCH /api/submissions/:id/status
// @access  Private (Guide / Admin)
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const submission = await Submission.findById(req.params.id).populate('team');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.status = status;
    await submission.save();

    // Notify Team Leader
    await Notification.create({
      recipient: submission.team.leader,
      sender: req.user._id,
      title: `Submission Status Updated: ${status}`,
      message: `Your paper version ${submission.versionLabel} status has been updated to "${status}".`,
      type: 'evaluation',
      link: `/student/submissions/${submission._id}`,
    });

    res.json({ success: true, message: 'Status updated successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
