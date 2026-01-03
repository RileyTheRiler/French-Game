/**
 * Analytics Utility for Mastery Dashboard
 */

// 1. Get Retention Data for Heatmap
// Returns an array of { date: 'YYYY-MM-DD', count: number, intensity: 0-4 }
export const getRetentionData = (vocabulary) => {
    const activityMap = new Map();
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Initialize map with 0 for all days in the last year (optional, or sparse)
    // For sparse, we just iterate history.

    vocabulary.forEach(word => {
        if (!word.reviewHistory) return;

        word.reviewHistory.forEach(review => {
            const date = new Date(review.timestamp).toISOString().split('T')[0];
            if (new Date(review.timestamp) < oneYearAgo) return;

            activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });

        // Also count 'addedAt' as activity
        if (word.addedAt) {
            const date = new Date(word.addedAt).toISOString().split('T')[0];
            if (new Date(word.addedAt) > oneYearAgo) {
                activityMap.set(date, (activityMap.get(date) || 0) + 1);
            }
        }
    });

    // Convert to array
    const data = [];
    activityMap.forEach((count, date) => {
        // Calculate intensity (0-4) based on count
        let intensity = 0;
        if (count > 0) intensity = 1;
        if (count > 5) intensity = 2;
        if (count > 15) intensity = 3;
        if (count > 30) intensity = 4;

        data.push({ date, count, intensity });
    });

    return data.sort((a, b) => a.date.localeCompare(b.date));
};

// 2. Get Category Skills for Radar Chart
// Returns array of { subject: 'CategoryName', A: proficiencyScore, fullMark: 100 }
export const getCategorySkills = (vocabulary, categories) => {
    const skills = {};

    // Initialize categories
    Object.keys(categories).forEach(key => {
        skills[categories[key].name] = { total: 0, mastered: 0, totalLevel: 0, count: 0 };
    });

    // Add "Imported" if not present
    if (!skills['Imported']) {
        skills['Imported'] = { total: 0, mastered: 0, totalLevel: 0, count: 0 };
    }

    vocabulary.forEach(word => {
        const catName = categories[word.category]?.name || 'Imported';

        if (!skills[catName]) {
            skills[catName] = { total: 0, mastered: 0, totalLevel: 0, count: 0 };
        }

        skills[catName].count++;
        skills[catName].totalLevel += (word.level || 1);

        // Assume level 5 is "mastered"
        if (word.level >= 5) {
            skills[catName].mastered++;
        }
    });

    return Object.keys(skills).map(key => {
        const data = skills[key];
        if (data.count === 0) return { subject: key, A: 0, fullMark: 100 };

        // Score calculation: Combination of coverage (mastered/total) and average level?
        // Let's maximize at 100.
        // If average level is 5 -> 100 points.
        const avgLevel = data.totalLevel / data.count;
        const score = Math.min(100, Math.round((avgLevel / 5) * 100)); // Normalize to 100 based on level 5 target

        return {
            subject: key,
            A: score,
            fullMark: 100,
            count: data.count
        };
    }).filter(s => s.count > 0).slice(0, 6); // Limit to top 6 categories for cleaner chart
};

// 3. Fluency Projection
// Returns { currentWordCount, projectedDates: { A2: date, B1: date, B2: date }, velocity: words/week }
export const predictFluency = (vocabulary) => {
    const knownWords = vocabulary.filter(w => (w.level || 0) > 1).length; // Filter strictly "new" words

    // Calculate velocity (words learning/mastered per week)
    // Look at last 30 days history
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const recentActivity = vocabulary.filter(w => w.addedAt > thirtyDaysAgo || w.reviewHistory?.some(r => r.timestamp > thirtyDaysAgo)).length;

    // Crude estimate: words engaged with in last 30 days / 4 weeks
    const velocityPerWeek = Math.max(1, recentActivity / 4);

    const getDaysToGoal = (goal) => {
        const remaining = Math.max(0, goal - knownWords);
        return Math.ceil(remaining / (velocityPerWeek / 7));
    };

    const addDays = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    };

    return {
        currentWordCount: knownWords,
        velocity: Math.round(velocityPerWeek),
        milestones: [
            { level: 'A1', words: 500, date: knownWords >= 500 ? 'Achieved' : addDays(getDaysToGoal(500)) },
            { level: 'A2', words: 1000, date: knownWords >= 1000 ? 'Achieved' : addDays(getDaysToGoal(1000)) },
            { level: 'B1', words: 2000, date: knownWords >= 2000 ? 'Achieved' : addDays(getDaysToGoal(2000)) },
            { level: 'B2', words: 4000, date: knownWords >= 4000 ? 'Achieved' : addDays(getDaysToGoal(4000)) }
        ]
    };
};
