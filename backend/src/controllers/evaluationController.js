import Evaluation from '../models/Evaluation.js';
import EvaluationParameter from '../models/EvaluationParameter.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';

// @desc    Get all evaluation parameters (or grouped by category)
// @route   GET /api/evaluations/parameters
// @access  Private
export const getParameters = async (req, res) => {
  try {
    const { isPresentation } = req.query;
    const filter = { isActive: true };
    if (isPresentation !== undefined) {
      filter.isPresentation = isPresentation === 'true';
    }

    const parameters = await EvaluationParameter.find(filter).sort({ order: 1 });
    res.json({ success: true, count: parameters.length, data: parameters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get evaluations (by submission, team, or evaluator)
// @route   GET /api/evaluations
// @access  Private
export const getEvaluations = async (req, res) => {
  try {
    const { submissionId, teamId } = req.query;
    let filter = {};

    if (submissionId) filter.submission = submissionId;
    if (teamId) filter.team = teamId;

    if (req.user.role === 'team_leader') {
      const myTeam = await Team.findOne({ leader: req.user._id });
      if (myTeam) filter.team = myTeam._id;
    }

    const evaluations = await Evaluation.find(filter)
      .populate('submission', 'version versionLabel title status submittedAt fileUrl externalLink')
      .populate('team', 'teamName projectTitle academicYear department')
      .populate('evaluator', 'name email department designation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: evaluations.length, data: evaluations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single evaluation by ID
// @route   GET /api/evaluations/:id
// @access  Private
export const getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate({
        path: 'submission',
        populate: { path: 'team' },
      })
      .populate('evaluator', 'name email department designation')
      .populate('team');

    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation record not found' });
    }

    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit / Update Paper Evaluation
// @route   POST /api/evaluations
// @access  Private (Guide / Admin)
export const submitEvaluation = async (req, res) => {
  try {
    const {
      submissionId,
      scores, // Array of { parameterId, paramName, category, marks, remarks, suggestion }
      strengths,
      weaknesses,
      suggestions,
      overallVerdict,
    } = req.body;

    const submission = await Submission.findById(submissionId).populate('team');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Check if evaluation already exists for this submission
    let evaluation = await Evaluation.findOne({ submission: submission._id });

    const formattedScores = scores.map((s) => ({
      parameter: s.parameter || s.parameterId,
      paramName: s.paramName || s.name,
      category: s.category || 'Research Quality',
      marks: Number(s.marks) || 0,
      maxMarks: Number(s.maxMarks) || 10,
      remarks: s.remarks || '',
      suggestion: s.suggestion || '',
    }));

    if (evaluation) {
      evaluation.scores = formattedScores;
      evaluation.strengths = strengths || evaluation.strengths;
      evaluation.weaknesses = weaknesses || evaluation.weaknesses;
      evaluation.suggestions = suggestions || evaluation.suggestions;
      evaluation.overallVerdict = overallVerdict || evaluation.overallVerdict;
      evaluation.evaluator = req.user._id;
      await evaluation.save();
    } else {
      evaluation = new Evaluation({
        submission: submission._id,
        team: submission.team._id,
        evaluator: req.user._id,
        version: submission.version,
        scores: formattedScores,
        strengths: strengths || '',
        weaknesses: weaknesses || '',
        suggestions: suggestions || '',
        overallVerdict: overallVerdict || 'Revision Required',
      });
      await evaluation.save();
    }

    // Update submission status based on verdict
    submission.status = overallVerdict === 'Approved' ? 'Approved' : 'Revision Required';
    await submission.save();

    // Create notification for team leader
    await Notification.create({
      recipient: submission.team.leader,
      sender: req.user._id,
      title: `Evaluation Published for ${submission.versionLabel}`,
      message: `Your guide has evaluated ${submission.versionLabel}. Score: ${evaluation.percentage}%. Verdict: ${evaluation.overallVerdict}`,
      type: 'evaluation',
      link: `/student/evaluations/${evaluation._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Paper evaluation saved successfully',
      data: evaluation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
