/**
 * Mock AI Clinical Summary Generator
 * In production, this would call OpenAI/Claude API
 * For now, it analyzes keywords and returns structured clinical data
 */

const generateMockClinicalSummary = (transcript) => {
    // Analyze transcript for keywords
    const text = transcript.toLowerCase();

    // Detect keywords for different categories
    const anxietyKeywords = ['anxiety', 'anxious', 'worried', 'panic', 'fear', 'nervous'];
    const depressionKeywords = ['depressed', 'sad', 'hopeless', 'worthless', 'tired', 'fatigue'];
    const sleepKeywords = ['insomnia', 'sleep', 'nightmare', 'can\'t sleep'];
    const angerKeywords = ['anger', 'irritable', 'frustrated', 'rage', 'angry'];
    const traumaKeywords = ['trauma', 'flashback', 'ptsd', 'abuse'];
    const substanceKeywords = ['alcohol', 'drug', 'addiction', 'drinking', 'smoking'];
    const suicidalKeywords = ['suicide', 'suicidal', 'kill myself', 'end it all', 'don\'t want to live'];

    // Count keyword matches
    const hasAnxiety = anxietyKeywords.some(k => text.includes(k));
    const hasDepression = depressionKeywords.some(k => text.includes(k));
    const hasSleep = sleepKeywords.some(k => text.includes(k));
    const hasAnger = angerKeywords.some(k => text.includes(k));
    const hasTrauma = traumaKeywords.some(k => text.includes(k));
    const hasSubstance = substanceKeywords.some(k => text.includes(k));
    const hasSuicidal = suicidalKeywords.some(k => text.includes(k));

    // Build symptoms array
    const symptoms = [];
    if (hasAnxiety) symptoms.push('Persistent anxiety and worry');
    if (hasDepression) symptoms.push('Depressed mood and loss of interest');
    if (hasSleep) symptoms.push('Sleep disturbances');
    if (hasAnger) symptoms.push('Irritability and anger management issues');
    if (hasTrauma) symptoms.push('Trauma-related symptoms');
    if (hasSubstance) symptoms.push('Substance use concerns');

    if (symptoms.length === 0) {
        symptoms.push('General stress and life challenges');
        symptoms.push('Mild adjustment difficulties');
    }

    // Determine mood
    let mood = 'Stable';
    let moodScore = 7;
    if (hasDepression || hasSuicidal) {
        mood = 'Low';
        moodScore = 3;
    } else if (hasAnxiety || hasAnger) {
        mood = 'Anxious';
        moodScore = 5;
    }

    // Risk assessment
    let riskLevel = 'Low';
    let riskColor = 'green';
    if (hasSuicidal) {
        riskLevel = 'High';
        riskColor = 'red';
    } else if (hasTrauma || hasSubstance) {
        riskLevel = 'Moderate';
        riskColor = 'yellow';
    }

    // Key concerns
    const concerns = [];
    if (hasSuicidal) concerns.push('Suicidal ideation - immediate safety assessment required');
    if (hasSubstance) concerns.push('Substance use patterns warrant further evaluation');
    if (hasTrauma) concerns.push('Trauma history may benefit from specialized therapy');
    if (concerns.length === 0) concerns.push('No immediate clinical concerns identified');

    // Treatment recommendations
    const recommendations = [];
    if (hasAnxiety) recommendations.push('Consider CBT for anxiety management');
    if (hasDepression) recommendations.push('Evaluate for antidepressant medication');
    if (hasSleep) recommendations.push('Sleep hygiene education and possible sleep study');
    if (hasTrauma) recommendations.push('EMDR or trauma-focused therapy');
    if (hasSubstance) recommendations.push('Substance use disorder assessment and treatment');
    if (hasSuicidal) recommendations.push('Immediate safety plan and crisis intervention');

    if (recommendations.length === 0) {
        recommendations.push('Continue supportive therapy');
        recommendations.push('Monitor symptoms and functioning');
    }

    // Possible DSM-5 diagnoses based on keywords
    const possibleDiagnoses = [];
    if (hasAnxiety) {
        const matched = anxietyKeywords.filter(k => text.includes(k));
        possibleDiagnoses.push({
            code: 'F41.1',
            name: 'Generalized Anxiety Disorder',
            confidence: 'Moderate',
            evidence: `Detected keywords: ${matched.join(', ')}`
        });
    }
    if (hasDepression) {
        const matched = depressionKeywords.filter(k => text.includes(k));
        possibleDiagnoses.push({
            code: 'F32.9',
            name: 'Major Depressive Disorder',
            confidence: 'Moderate',
            evidence: `Detected keywords: ${matched.join(', ')}`
        });
    }
    if (hasTrauma) {
        const matched = traumaKeywords.filter(k => text.includes(k));
        possibleDiagnoses.push({
            code: 'F43.10',
            name: 'Post-Traumatic Stress Disorder',
            confidence: 'Low',
            evidence: `Detected keywords: ${matched.join(', ')}`
        });
    }
    if (hasSubstance) {
        const matched = substanceKeywords.filter(k => text.includes(k));
        possibleDiagnoses.push({
            code: 'F10.20',
            name: 'Alcohol Use Disorder',
            confidence: 'Low',
            evidence: `Detected keywords: ${matched.join(', ')}`
        });
    }

    // Build structured summary
    const summary = {
        generatedAt: new Date().toISOString(),
        sessionDuration: '45 minutes',

        overview: {
            primaryConcerns: symptoms.slice(0, 3),
            mood: mood,
            moodScore: moodScore,
            affect: hasAnger ? 'Irritable' : hasAnxiety ? 'Anxious' : 'Appropriate',
            engagement: 'Good',
        },

        symptoms: {
            reported: symptoms,
            severity: riskLevel === 'High' ? 'Severe' : riskLevel === 'Moderate' ? 'Moderate' : 'Mild',
            duration: 'Several weeks',
        },

        riskAssessment: {
            level: riskLevel,
            color: riskColor,
            suicidalIdeation: hasSuicidal,
            homicidalIdeation: false,
            concerns: concerns,
        },

        clinicalImpression: {
            possibleDiagnoses: possibleDiagnoses.length > 0 ? possibleDiagnoses : [
                { code: 'Z63.0', name: 'Adjustment Disorder', confidence: 'Low' }
            ],
            functionalImpairment: riskLevel === 'High' ? 'Severe' : riskLevel === 'Moderate' ? 'Moderate' : 'Mild',
        },

        clinicalInsights: {
            themes: [
                hasAnxiety ? 'Anxiety Management' : 'Emotional Regulation',
                hasDepression ? 'Mood Monitoring' : 'Daily Functioning',
                hasSubstance ? 'Coping Mechanisms' : 'Stress Reduction'
            ],
            behavioralObservations: 'Patient was cooperative and engaged throughout the session.',
        },

        treatmentPlan: {
            recommendations: recommendations,
            followUp: hasSuicidal ? 'Within 48 hours' : riskLevel === 'Moderate' ? 'Within 1 week' : 'Within 2 weeks',
            referrals: hasSuicidal ? ['Crisis intervention', 'Psychiatric evaluation'] :
                hasSubstance ? ['Substance abuse counseling'] : [],
        },

        nextSteps: [
            hasSuicidal ? 'Create safety plan' : 'Continue monitoring symptoms',
            'Schedule follow-up appointment',
            recommendations[0] || 'Continue current treatment approach',
        ],
    };

    return summary;
};

module.exports = { generateMockClinicalSummary };
