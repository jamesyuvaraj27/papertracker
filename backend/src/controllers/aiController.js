// AI Paper Assistant Controller (Simulated intelligent paper reviewer & format validator)

export const analyzePaperAbstract = async (req, res) => {
  try {
    const { title, abstract, keywords } = req.body;

    if (!title || !abstract) {
      return res.status(400).json({ success: false, message: 'Paper title and abstract are required for analysis' });
    }

    const wordCount = abstract.trim().split(/\s+/).length;
    const isOptimalLength = wordCount >= 150 && wordCount <= 250;

    // Intelligent heuristic analysis
    const hasBackground = /background|motivation|recently|growing demand|advent of/i.test(abstract);
    const hasProblem = /problem|challenge|issue|limitation|lack of|however/i.test(abstract);
    const hasMethod = /propose|methodology|architecture|algorithm|framework|model|approach/i.test(abstract);
    const hasResults = /results|show|achieved|accuracy|precision|outperforms|evaluated|tested/i.test(abstract);
    const hasConclusion = /conclude|demonstrates|future|potential|findings/i.test(abstract);

    const scores = {
      completenessScore: (hasBackground + hasProblem + hasMethod + hasResults + hasConclusion) * 20,
      lengthScore: isOptimalLength ? 100 : wordCount < 150 ? Math.round((wordCount / 150) * 90) : 85,
      clarityScore: 88,
    };

    const overallScore = Math.round((scores.completenessScore * 0.5) + (scores.lengthScore * 0.3) + (scores.clarityScore * 0.2));

    const recommendations = [];
    if (!hasBackground) recommendations.push('Add a concise 1-2 sentence background highlighting context.');
    if (!hasProblem) recommendations.push('Explicitly articulate the exact research problem or gap addressed.');
    if (!hasMethod) recommendations.push('Highlight the proposed methodology, architecture, or key algorithmic novelty.');
    if (!hasResults) recommendations.push('Include specific quantitative benchmark results (e.g., accuracy, speedup, error rate).');
    if (wordCount < 150) recommendations.push(`Current abstract length is ${wordCount} words. IEEE standard recommends 150–250 words.`);
    if (wordCount > 250) recommendations.push(`Current abstract length is ${wordCount} words. Trim to under 250 words for IEEE compliance.`);

    const strengths = [
      hasMethod ? 'Clear mention of proposed technical approach.' : 'Covers relevant subject matter.',
      hasResults ? 'Includes performance metrics and quantitative validation.' : 'Addresses current technological landscape.',
      'Appropriate academic terminology utilized.'
    ];

    const predictedReadiness = overallScore >= 80 ? 'High (Ready for Guide Review)' : overallScore >= 60 ? 'Moderate (Revisions Recommended)' : 'Needs Improvement';

    res.json({
      success: true,
      data: {
        title,
        wordCount,
        overallScore,
        predictedReadiness,
        criteria: {
          backgroundAndContext: hasBackground,
          problemStatementIdentified: hasProblem,
          methodologyExplained: hasMethod,
          quantitativeResultsStated: hasResults,
          conclusionProvided: hasConclusion,
        },
        strengths,
        recommendations,
        ieeeChecklist: [
          { item: 'Abstract word limit (150-250 words)', passed: isOptimalLength },
          { item: 'No citation references in abstract', passed: !/\[\d+\]/.test(abstract) },
          { item: 'Keywords provided (4-6 recommended)', passed: (keywords && keywords.length >= 4) || false },
          { item: 'Contains quantitative metrics (%)', passed: /%|\baccuracy\b|\bf1\b|\blatency\b/i.test(abstract) },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
