import PresentationReview from '../models/PresentationReview.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';

// @desc    Get presentation reviews
// @route   GET /api/presentations
// @access  Private
export const getPresentationReviews = async (req, res) => {
  try {
    const { teamId, reviewType } = req.query;
    let query = {};

    if (teamId) {
      query.team = teamId;
    } else if (req.user.role === 'team_leader') {
      const myTeam = await Team.findOne({ leader: req.user._id });
      if (myTeam) query.team = myTeam._id;
    } else if (req.user.role === 'guide') {
      const myTeams = await Team.find({ guide: req.user._id }).select('_id');
      query.team = { $in: myTeams.map((t) => t._id) };
    }

    if (reviewType) query.reviewType = reviewType;

    const reviews = await PresentationReview.find(query)
      .populate('team', 'teamName projectTitle academicYear department')
      .populate('evaluator', 'name email department designation')
      .populate('panelMembers', 'name email department designation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit / Save Presentation Review
// @route   POST /api/presentations
// @access  Private (Guide / Admin)
export const submitPresentationReview = async (req, res) => {
  try {
    const {
      teamId,
      reviewType,
      scores,
      generalFeedback,
      recommendation,
      panelMemberIds,
    } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check if review of this type exists for this team
    let review = await PresentationReview.findOne({ team: teamId, reviewType });

    const formattedScores = scores.map((s) => ({
      parameter: s.parameter || s.parameterId,
      paramName: s.paramName || s.name,
      marks: Number(s.marks) || 0,
      maxMarks: Number(s.maxMarks) || 10,
      remarks: s.remarks || '',
    }));

    if (review) {
      review.scores = formattedScores;
      review.generalFeedback = generalFeedback || review.generalFeedback;
      review.recommendation = recommendation || review.recommendation;
      review.evaluator = req.user._id;
      if (panelMemberIds) review.panelMembers = panelMemberIds;
      review.status = 'Completed';
      await review.save();
    } else {
      review = new PresentationReview({
        team: teamId,
        reviewType: reviewType || 'Review 1',
        panelMembers: panelMemberIds || [req.user._id],
        evaluator: req.user._id,
        scores: formattedScores,
        generalFeedback: generalFeedback || '',
        recommendation: recommendation || 'Good - Minor Changes',
        status: 'Completed',
      });
      await review.save();
    }

    // Notify student leader
    await Notification.create({
      recipient: team.leader,
      sender: req.user._id,
      title: `${reviewType} Score Published`,
      message: `Your presentation review score for ${reviewType} is ${review.percentage}%. Recommendation: ${review.recommendation}`,
      type: 'presentation',
      link: `/student/presentation-reviews`,
    });

    res.status(200).json({
      success: true,
      message: `${reviewType} submitted successfully`,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
