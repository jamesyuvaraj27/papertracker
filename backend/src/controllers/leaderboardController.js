import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import PresentationReview from '../models/PresentationReview.js';

// @desc    Get master leaderboard with dynamic filtering and rank computation
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const { academicYear, department, guideId } = req.query;
    let filter = {};

    if (academicYear) filter.academicYear = academicYear;
    if (department) filter.department = department;
    if (guideId) filter.guide = guideId;

    const teams = await Team.find(filter)
      .populate('guide', 'name email department designation')
      .populate('leader', 'name email')
      .lean();

    const leaderboardEntries = await Promise.all(
      teams.map(async (team) => {
        // Find latest submission
        const submissions = await Submission.find({ team: team._id }).sort({ version: -1 }).lean();
        const latestSubmission = submissions[0] || null;

        // Paper evaluation
        let paperScore = 0;
        let paperVerdict = 'No Submission';
        let latestVersion = 'None';

        if (latestSubmission) {
          latestVersion = latestSubmission.versionLabel;
          const evaluation = await Evaluation.findOne({ submission: latestSubmission._id }).lean();
          if (evaluation) {
            paperScore = evaluation.percentage;
            paperVerdict = evaluation.overallVerdict;
          }
        }

        // Presentation reviews
        const presentations = await PresentationReview.find({ team: team._id }).lean();
        let presentationScore = 0;
        if (presentations.length > 0) {
          const totalPres = presentations.reduce((acc, curr) => acc + curr.percentage, 0);
          presentationScore = Number((totalPres / presentations.length).toFixed(1));
        }

        // Score Calculation Formula: 70% Paper + 30% Presentation
        const finalScore = Number(((paperScore * 0.7) + (presentationScore * 0.3)).toFixed(2));

        return {
          teamId: team._id,
          teamName: team.teamName,
          projectTitle: team.projectTitle,
          academicYear: team.academicYear,
          department: team.department,
          domain: team.domain,
          guide: team.guide,
          leader: team.leader,
          membersCount: (team.members || []).length + 1,
          submissionsCount: submissions.length,
          latestVersion,
          paperScore,
          paperVerdict,
          presentationScore,
          presentationReviewsCount: presentations.length,
          finalScore,
        };
      })
    );

    // Sort by finalScore descending, then by paperScore descending
    leaderboardEntries.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      return b.paperScore - a.paperScore;
    });

    // Assign rank
    const rankedList = leaderboardEntries.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    res.json({
      success: true,
      count: rankedList.length,
      data: rankedList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
