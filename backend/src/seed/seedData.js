import User from '../models/User.js';
import EvaluationParameter from '../models/EvaluationParameter.js';
import AcademicYear from '../models/AcademicYear.js';

export const seedDatabase = async () => {
  try {
    // 1. Seed Single Admin Account if no admin exists
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@institution.edu').trim().toLowerCase();
    const existingAdmin = await User.findOne({ 
      $or: [{ role: 'admin' }, { email: adminEmail }] 
    });

    if (!existingAdmin) {
      const adminName = process.env.ADMIN_NAME || 'Institutional Administrator';
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword@2026';

      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        department: 'Academic Project Coordination',
        designation: 'Institutional Project Coordinator',
        phoneNumber: '',
        isActive: true,
      });
      console.log(`[Seed] Initial Admin account provisioned: ${adminEmail}`);
    }

    // 2. Initialize Standard Evaluation Parameters if empty
    const parameterCount = await EvaluationParameter.countDocuments();
    if (parameterCount === 0) {
      const paperParameters = [
        // Research Quality
        { name: 'Abstract', category: 'Research Quality', description: 'Concise summary including background, problem, method, results', order: 1 },
        { name: 'Introduction', category: 'Research Quality', description: 'Context setting, research motivation and scope', order: 2 },
        { name: 'Problem Statement', category: 'Research Quality', description: 'Clear formulation of the specific challenge tackled', order: 3 },
        { name: 'Objectives', category: 'Research Quality', description: 'Concrete, measurable goals of the project/paper', order: 4 },
        { name: 'Literature Review', category: 'Research Quality', description: 'Comprehensive survey of current state-of-the-art', order: 5 },
        { name: 'Research Gap', category: 'Research Quality', description: 'Critical analysis of limitations in existing literature', order: 6 },
        { name: 'Methodology', category: 'Research Quality', description: 'System architecture, theoretical model, and workflow', order: 7 },
        { name: 'Implementation', category: 'Research Quality', description: 'Algorithms, tech stack, codebase, and toolsets', order: 8 },
        { name: 'Experimental Setup', category: 'Research Quality', description: 'Datasets, baseline comparisons, hardware/env parameters', order: 9 },
        { name: 'Results & Analysis', category: 'Research Quality', description: 'Quantitative validation, graphs, benchmark metrics', order: 10 },
        { name: 'Discussion', category: 'Research Quality', description: 'Interpretation of results and comparative advantages', order: 11 },
        { name: 'Conclusion', category: 'Research Quality', description: 'Summary of findings and research takeaways', order: 12 },
        { name: 'Future Scope', category: 'Research Quality', description: 'Actionable future extensions and enhancements', order: 13 },
        { name: 'References & Citations', category: 'Research Quality', description: 'Quality and recency of cited peer-reviewed papers', order: 14 },
        
        // Writing Quality
        { name: 'Grammar & Mechanics', category: 'Writing Quality', description: 'Proper grammatical syntax, spelling, and sentence structures', order: 15 },
        { name: 'Academic Language', category: 'Writing Quality', description: 'Professional, objective scientific tone', order: 16 },
        { name: 'Formatting & Layout', category: 'Writing Quality', description: 'Two-column IEEE layout, margins, font consistency', order: 17 },
        { name: 'Clarity & Cohesion', category: 'Writing Quality', description: 'Logical flow between paragraphs and sections', order: 18 },

        // Technical Quality
        { name: 'Novelty & Originality', category: 'Technical Quality', description: 'Original contribution beyond existing public implementations', order: 19 },
        { name: 'Innovation & Creativity', category: 'Technical Quality', description: 'Innovative problem solving and design approach', order: 20 },
        { name: 'Technical Depth & Complexity', category: 'Technical Quality', description: 'Mathematical, algorithmic, or architectural rigor', order: 21 },
        { name: 'Practical Impact & Usability', category: 'Technical Quality', description: 'Real-world applicability and practical relevance', order: 22 },
        { name: 'Scalability & Robustness', category: 'Technical Quality', description: 'System performance under high loads/varied data', order: 23 },

        // Conference Readiness
        { name: 'IEEE Format Compliance', category: 'Conference Readiness', description: 'Strict adherence to IEEE conference template', order: 24 },
        { name: 'Citation Quality & Style', category: 'Conference Readiness', description: 'Correct IEEE reference styling and bracket citations', order: 25 },
        { name: 'Figures & Tables Quality', category: 'Conference Readiness', description: 'High-res vector/diagrams with informative captions', order: 26 },
      ];

      const presentationParameters = [
        { name: 'Presentation Skills', category: 'Presentation Review', description: 'Stage presence, confidence, and pacing', isPresentation: true, order: 1 },
        { name: 'Introduction & Motivation', category: 'Presentation Review', description: 'Clarity of the project background and importance', isPresentation: true, order: 2 },
        { name: 'Problem Understanding', category: 'Presentation Review', description: 'Mastery over the problem and technical domain', isPresentation: true, order: 3 },
        { name: 'Literature Review', category: 'Presentation Review', description: 'Knowledge of existing methods and comparative gap', isPresentation: true, order: 4 },
        { name: 'Methodology & Design', category: 'Presentation Review', description: 'Clarity of architecture, modules, and data flow', isPresentation: true, order: 5 },
        { name: 'Implementation Progress', category: 'Presentation Review', description: 'Code completion, modules integrated, engineering rigor', isPresentation: true, order: 6 },
        { name: 'Results & Demonstration', category: 'Presentation Review', description: 'Live working demo or experimental output proof', isPresentation: true, order: 7 },
        { name: 'Innovation Factor', category: 'Presentation Review', description: 'Uniqueness of the approach', isPresentation: true, order: 8 },
        { name: 'Communication & Team Synergy', category: 'Presentation Review', description: 'Participation and articulation by all team members', isPresentation: true, order: 9 },
        { name: 'Q&A Defense', category: 'Presentation Review', description: 'Ability to answer questions from review panel', isPresentation: true, order: 10 },
        { name: 'Time Management', category: 'Presentation Review', description: 'Adherence to the allotted presentation time', isPresentation: true, order: 11 },
        { name: 'Documentation & Report', category: 'Presentation Review', description: 'Completeness of interim project report and slides', isPresentation: true, order: 12 },
      ];

      await EvaluationParameter.create([...paperParameters, ...presentationParameters]);
      console.log('[Seed] Standard IEEE paper and presentation rubric parameters initialized.');
    }

    // 3. Initialize Default Academic Session if empty
    const yearCount = await AcademicYear.countDocuments();
    if (yearCount === 0) {
      await AcademicYear.create([
        { year: '2026-2027', label: 'Academic Session 2026-2027', isActive: true },
      ]);
      console.log('[Seed] Default active academic session (2026-2027) initialized.');
    }

  } catch (error) {
    console.error('Error during database initialization:', error.message);
  }
};
