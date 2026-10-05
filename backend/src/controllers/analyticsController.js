import Team from '../models/Team.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import PresentationReview from '../models/PresentationReview.js';

// @desc    Get comprehensive system analytics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const { academicYear } = req.query;
    let teamFilter = {};
    if (academicYear) teamFilter.academicYear = academicYear;

    const totalTeams = await Team.countDocuments(teamFilter);
    const totalGuides = await User.countDocuments({ role: 'guide', isActive: true });
    const totalStudents = await User.countDocuments({ role: 'team_leader' });
    const totalSubmissions = await Submission.countDocuments();
    const totalEvaluations = await Evaluation.countDocuments();
    const totalPresentations = await PresentationReview.countDocuments();

    // Calculate score trends across versions (V1, V2, V3, V4)
    const versionScores = await Evaluation.aggregate([
      {
        $group: {
          _id: '$version',
          avgScore: { $avg: '$percentage' },
          count: { $sum: 1 },
          maxScore: { $max: '$percentage' },
          minScore: { $min: '$percentage' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const versionTrendData = versionScores.map((v) => ({
      version: `Version ${v._id}`,
      avgScore: Number(v.avgScore.toFixed(1)),
      submissions: v.count,
      highestScore: Number(v.maxScore.toFixed(1)),
      lowestScore: Number(v.minScore.toFixed(1)),
    }));

    // Calculate IEEE Category strengths (Research Quality, Writing Quality, Technical Quality, Conference Readiness)
    const allEvaluations = await Evaluation.find().lean();
    const categoryStats = {
      'Research Quality': { total: 0, count: 0 },
      'Writing Quality': { total: 0, count: 0 },
      'Technical Quality': { total: 0, count: 0 },
      'Conference Readiness': { total: 0, count: 0 },
    };

    allEvaluations.forEach((evaluation) => {
      if (evaluation.scores && evaluation.scores.length > 0) {
        evaluation.scores.forEach((s) => {
          if (categoryStats[s.category]) {
            categoryStats[s.category].total += s.marks;
            categoryStats[s.category].count += 1;
          }
        });
      }
    });

    const categoryRadarData = Object.keys(categoryStats).map((cat) => ({
      category: cat,
      score: categoryStats[cat].count > 0 
        ? Number(((categoryStats[cat].total / (categoryStats[cat].count * 10)) * 100).toFixed(1))
        : 0,
      fullMark: 100,
    }));

    // Status distributions
    const statusCounts = await Submission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const submissionStatusPie = statusCounts.map((s) => ({
      name: s._id || 'Unknown',
      value: s.count,
    }));

    // Guide review performance
    const guides = await User.find({ role: 'guide' }).select('name department designation').lean();
    const guidePerformance = await Promise.all(
      guides.map(async (guide) => {
        const teams = await Team.find({ guide: guide._id }).select('_id');
        const teamIds = teams.map((t) => t._id);
        const submissions = await Submission.find({ team: { $in: teamIds } });
        const evaluated = await Evaluation.find({ evaluator: guide._id });

        return {
          guideName: guide.name,
          department: guide.department,
          assignedTeams: teams.length,
          totalSubmissions: submissions.length,
          completedReviews: evaluated.length,
          pendingReviews: Math.max(0, submissions.length - evaluated.length),
        };
      })
    );

    // Identify top 5 and weak 5 teams for intervention
    const teams = await Team.find(teamFilter).populate('guide', 'name').lean();
    const teamPerformances = await Promise.all(
      teams.map(async (t) => {
        const latestSub = await Submission.findOne({ team: t._id }).sort({ version: -1 });
        let score = 0;
        if (latestSub) {
          const evalDoc = await Evaluation.findOne({ submission: latestSub._id });
          if (evalDoc) score = evalDoc.percentage;
        }
        return {
          teamId: t._id,
          teamName: t.teamName,
          projectTitle: t.projectTitle,
          guideName: t.guide ? t.guide.name : 'Unassigned',
          score,
        };
      })
    );

    teamPerformances.sort((a, b) => b.score - a.score);
    const topTeams = teamPerformances.slice(0, 5);
    const weakTeams = teamPerformances.filter((t) => t.score < 60 || t.score === 0).slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalTeams,
          totalGuides,
          totalStudents,
          totalSubmissions,
          totalEvaluations,
          totalPresentations,
        },
        versionTrendData,
        categoryRadarData,
        submissionStatusPie,
        guidePerformance,
        topTeams,
        weakTeams,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
