const db = require('../config/db');

const disorders = [
    // ===== MOOD DISORDERS =====
    {
        code: 'F32.0',
        name: 'Major Depressive Disorder, Single Episode, Mild',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Depressed mood most of the day, nearly every day',
            'Markedly diminished interest or pleasure in activities',
            'Fatigue or loss of energy nearly every day',
            'Feelings of worthlessness or excessive guilt'
        ]),
        full_criteria: 'A. Five (or more) of the following symptoms have been present during the same 2-week period and represent a change from previous functioning; at least one of the symptoms is either (1) depressed mood or (2) loss of interest or pleasure. 1. Depressed mood most of the day, nearly every day. 2. Markedly diminished interest or pleasure in all, or almost all, activities. 3. Significant weight loss or weight gain. 4. Insomnia or hypersomnia nearly every day. 5. Psychomotor agitation or retardation. 6. Fatigue or loss of energy. 7. Feelings of worthlessness or excessive or inappropriate guilt. 8. Diminished ability to think or concentrate. 9. Recurrent thoughts of death or suicidal ideation.'
    },
    {
        code: 'F32.1',
        name: 'Major Depressive Disorder, Single Episode, Moderate',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Depressed mood most of the day, nearly every day',
            'Markedly diminished interest or pleasure in activities',
            'Significant weight loss or gain, or changes in appetite',
            'Insomnia or hypersomnia nearly every day',
            'Psychomotor agitation or retardation'
        ]),
        full_criteria: 'A. Five (or more) of the following symptoms have been present during the same 2-week period and represent a change from previous functioning. Severity is moderate, with symptoms between mild and severe, and moderate difficulty in social, occupational, or educational functioning.'
    },
    {
        code: 'F32.2',
        name: 'Major Depressive Disorder, Single Episode, Severe',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Depressed mood most of the day, nearly every day',
            'Markedly diminished interest or pleasure in activities',
            'Significant weight loss or gain',
            'Recurrent thoughts of death or suicidal ideation',
            'Feelings of worthlessness or excessive guilt',
            'Diminished ability to think or concentrate'
        ]),
        full_criteria: 'A. Five (or more) of the following symptoms have been present during the same 2-week period and represent a change from previous functioning. The number of symptoms is substantially in excess of that required to make the diagnosis, the intensity of symptoms is seriously distressing and unmanageable, and the symptoms markedly interfere with social and occupational functioning.'
    },
    {
        code: 'F33.0',
        name: 'Major Depressive Disorder, Recurrent, Mild',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Recurrent episodes of depressed mood',
            'Diminished interest or pleasure in activities',
            'Fatigue or loss of energy',
            'History of at least one prior major depressive episode'
        ]),
        full_criteria: 'A. There have been at least two major depressive episodes. B. The major depressive episodes are not better explained by schizoaffective disorder and are not superimposed on schizophrenia, schizophreniform disorder, delusional disorder, or other psychotic disorders. C. There has never been a manic episode or a hypomanic episode.'
    },
    {
        code: 'F34.1',
        name: 'Persistent Depressive Disorder (Dysthymia)',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Depressed mood for most of the day, more days than not, for at least 2 years',
            'Poor appetite or overeating',
            'Insomnia or hypersomnia',
            'Low energy or fatigue',
            'Low self-esteem',
            'Poor concentration or difficulty making decisions',
            'Feelings of hopelessness'
        ]),
        full_criteria: 'A. Depressed mood for most of the day, for more days than not, as indicated by subjective account or observation, for at least 2 years (1 year for children/adolescents). B. Presence of two (or more) of the following: poor appetite or overeating, insomnia or hypersomnia, low energy or fatigue, low self-esteem, poor concentration, feelings of hopelessness. C. During the 2-year period, the individual has never been without the symptoms for more than 2 months at a time.'
    },
    {
        code: 'F31.9',
        name: 'Bipolar I Disorder',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Distinct period of abnormally elevated, expansive, or irritable mood lasting at least 1 week',
            'Increased goal-directed activity or energy',
            'Inflated self-esteem or grandiosity',
            'Decreased need for sleep',
            'More talkative than usual or pressure to keep talking',
            'Flight of ideas or subjective experience of racing thoughts',
            'Distractibility'
        ]),
        full_criteria: 'A. A distinct period of abnormally and persistently elevated, expansive, or irritable mood and abnormally and persistently increased goal-directed activity or energy, lasting at least 1 week and present most of the day, nearly every day (or any duration if hospitalization is necessary). B. During the period of mood disturbance and increased energy or activity, three (or more) of the following symptoms are present to a significant degree.'
    },
    {
        code: 'F31.81',
        name: 'Bipolar II Disorder',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'At least one hypomanic episode lasting at least 4 consecutive days',
            'At least one major depressive episode lasting at least 2 weeks',
            'Elevated, expansive, or irritable mood during hypomania',
            'Increased energy or activity during hypomania',
            'No history of full manic episodes'
        ]),
        full_criteria: 'A. Criteria have been met for at least one hypomanic episode and at least one major depressive episode. B. There has never been a manic episode. C. The occurrence of the hypomanic episode(s) and major depressive episode(s) is not better explained by schizoaffective disorder, schizophrenia, schizophreniform disorder, delusional disorder, or other specified or unspecified schizophrenia spectrum and other psychotic disorder.'
    },
    {
        code: 'F34.0',
        name: 'Cyclothymic Disorder',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Numerous periods of hypomanic symptoms for at least 2 years',
            'Numerous periods of depressive symptoms that do not meet criteria for major depressive episode',
            'Symptoms present for at least half the time',
            'Never without symptoms for more than 2 months'
        ]),
        full_criteria: 'A. For at least 2 years (at least 1 year in children and adolescents) there have been numerous periods with hypomanic symptoms that do not meet criteria for a hypomanic episode and numerous periods with depressive symptoms that do not meet criteria for a major depressive episode. B. The hypomanic and depressive periods have been present for at least half the time during the 2-year period. C. Criteria for a major depressive, manic, or hypomanic episode have never been met.'
    },
    {
        code: 'F32.81',
        name: 'Premenstrual Dysphoric Disorder',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Marked affective lability (mood swings)',
            'Marked irritability or anger or increased interpersonal conflicts',
            'Marked depressed mood, feelings of hopelessness, or self-deprecating thoughts',
            'Marked anxiety, tension, or feelings of being keyed up or on edge',
            'Symptoms occur in the final week before the onset of menses'
        ]),
        full_criteria: 'A. In the majority of menstrual cycles, at least five symptoms must be present in the final week before the onset of menses, start to improve within a few days after the onset of menses, and become minimal or absent in the week postmenses. B. One (or more) of the following symptoms must be present: marked affective lability, marked irritability or anger, marked depressed mood, marked anxiety or tension.'
    },

    // ===== ANXIETY DISORDERS =====
    {
        code: 'F41.1',
        name: 'Generalized Anxiety Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Excessive anxiety and worry occurring more days than not for at least 6 months',
            'Difficulty controlling the worry',
            'Restlessness or feeling keyed up or on edge',
            'Being easily fatigued',
            'Difficulty concentrating or mind going blank',
            'Muscle tension',
            'Sleep disturbance'
        ]),
        full_criteria: 'A. Excessive anxiety and worry (apprehensive expectation), occurring more days than not for at least 6 months, about a number of events or activities (such as work or school performance). B. The individual finds it difficult to control the worry. C. The anxiety and worry are associated with three (or more) of the following six symptoms: restlessness, easily fatigued, difficulty concentrating, irritability, muscle tension, sleep disturbance.'
    },
    {
        code: 'F41.0',
        name: 'Panic Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Recurrent unexpected panic attacks',
            'Palpitations, pounding heart, or accelerated heart rate',
            'Sweating, trembling, or shaking',
            'Sensations of shortness of breath or smothering',
            'Feelings of choking',
            'Chest pain or discomfort',
            'Fear of losing control or "going crazy"',
            'Fear of dying'
        ]),
        full_criteria: 'A. Recurrent unexpected panic attacks. A panic attack is an abrupt surge of intense fear or intense discomfort that reaches a peak within minutes, during which four (or more) of the following symptoms occur: palpitations, sweating, trembling, shortness of breath, feelings of choking, chest pain, nausea, dizziness, chills or heat sensations, paresthesias, derealization or depersonalization, fear of losing control, fear of dying. B. At least one of the attacks has been followed by 1 month or more of persistent concern about additional attacks or maladaptive change in behavior.'
    },
    {
        code: 'F40.10',
        name: 'Social Anxiety Disorder (Social Phobia)',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Marked fear or anxiety about social situations where one may be scrutinized',
            'Fear of acting in a way that will be negatively evaluated',
            'Social situations almost always provoke fear or anxiety',
            'Social situations are avoided or endured with intense fear or anxiety',
            'The fear or anxiety is out of proportion to the actual threat'
        ]),
        full_criteria: 'A. Marked fear or anxiety about one or more social situations in which the individual is exposed to possible scrutiny by others. B. The individual fears that he or she will act in a way or show anxiety symptoms that will be negatively evaluated. C. The social situations almost always provoke fear or anxiety. D. The social situations are avoided or endured with intense fear or anxiety. E. The fear or anxiety is out of proportion to the actual threat. F. The fear, anxiety, or avoidance is persistent, typically lasting for 6 months or more.'
    },
    {
        code: 'F40.218',
        name: 'Specific Phobia',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Marked fear or anxiety about a specific object or situation',
            'The phobic object or situation almost always provokes immediate fear or anxiety',
            'The phobic object or situation is actively avoided or endured with intense fear',
            'The fear or anxiety is out of proportion to the actual danger',
            'The fear, anxiety, or avoidance is persistent, typically lasting 6 months or more'
        ]),
        full_criteria: 'A. Marked fear or anxiety about a specific object or situation (e.g., flying, heights, animals, receiving an injection, seeing blood). B. The phobic object or situation almost always provokes immediate fear or anxiety. C. The phobic object or situation is actively avoided or endured with intense fear or anxiety. D. The fear or anxiety is out of proportion to the actual danger posed. E. The fear, anxiety, or avoidance is persistent, typically lasting for 6 months or more. F. The fear, anxiety, or avoidance causes clinically significant distress or impairment.'
    },
    {
        code: 'F40.00',
        name: 'Agoraphobia',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Marked fear or anxiety about using public transportation',
            'Fear of being in open spaces',
            'Fear of being in enclosed places',
            'Fear of standing in line or being in a crowd',
            'Fear of being outside of the home alone',
            'Avoidance of these situations due to fear of panic-like symptoms'
        ]),
        full_criteria: 'A. Marked fear or anxiety about two (or more) of the following five situations: using public transportation, being in open spaces, being in enclosed places, standing in line or being in a crowd, being outside of the home alone. B. The individual fears or avoids these situations because of thoughts that escape might be difficult or help might not be available in the event of developing panic-like symptoms. C. The agoraphobic situations almost always provoke fear or anxiety. D. Actively avoided, require a companion, or endured with intense fear. E. Out of proportion to actual danger. F. Persistent, typically lasting 6 months or more.'
    },
    {
        code: 'F93.0',
        name: 'Separation Anxiety Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Recurrent excessive distress when anticipating or experiencing separation from home or attachment figures',
            'Persistent worry about losing major attachment figures',
            'Persistent worry about experiencing an untoward event that causes separation',
            'Reluctance or refusal to go out because of fear of separation',
            'Fear of being alone or without attachment figures',
            'Nightmares involving the theme of separation'
        ]),
        full_criteria: 'A. Developmentally inappropriate and excessive fear or anxiety concerning separation from those to whom the individual is attached, as evidenced by three (or more) of the following: recurrent excessive distress about separation, worry about losing attachment figures, worry about untoward events, reluctance to go out, fear of being alone, reluctance to sleep away from home, nightmares about separation, complaints of physical symptoms when separation occurs. B. Duration of at least 4 weeks in children and adolescents and typically 6 months or more in adults.'
    },
    {
        code: 'F94.0',
        name: 'Selective Mutism',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Consistent failure to speak in specific social situations where speaking is expected',
            'Speaks freely in other situations (e.g., at home)',
            'Interferes with educational or occupational achievement or social communication',
            'Duration of at least 1 month (not limited to the first month of school)'
        ]),
        full_criteria: 'A. Consistent failure to speak in specific social situations in which there is an expectation for speaking (e.g., at school) despite speaking in other situations. B. The disturbance interferes with educational or occupational achievement or with social communication. C. The duration of the disturbance is at least 1 month (not limited to the first month of school). D. The failure to speak is not attributable to a lack of knowledge of, or comfort with, the spoken language. E. The disturbance is not better explained by a communication disorder.'
    },

    // ===== PSYCHOTIC DISORDERS =====
    {
        code: 'F20.9',
        name: 'Schizophrenia',
        category: 'Psychotic Disorders',
        key_symptoms: JSON.stringify([
            'Delusions (false, fixed beliefs)',
            'Hallucinations (perceiving things that are not present)',
            'Disorganized speech (e.g., frequent derailment or incoherence)',
            'Grossly disorganized or catatonic behavior',
            'Negative symptoms (diminished emotional expression, avolition)'
        ]),
        full_criteria: 'A. Two (or more) of the following, each present for a significant portion of time during a 1-month period (or less if successfully treated). At least one of these must be (1), (2), or (3): 1. Delusions. 2. Hallucinations. 3. Disorganized speech. 4. Grossly disorganized or catatonic behavior. 5. Negative symptoms. B. Level of functioning in one or more major areas is markedly below the level achieved prior to the onset. C. Continuous signs of the disturbance persist for at least 6 months.'
    },
    {
        code: 'F25.9',
        name: 'Schizoaffective Disorder',
        category: 'Psychotic Disorders',
        key_symptoms: JSON.stringify([
            'An uninterrupted period during which there is a major mood episode concurrent with Criterion A of schizophrenia',
            'Delusions or hallucinations for 2 or more weeks in the absence of a major mood episode',
            'Symptoms of a major mood episode are present for the majority of the total duration',
            'The disturbance is not attributable to substance effects'
        ]),
        full_criteria: 'A. An uninterrupted period of illness during which there is a major mood episode (major depressive or manic) concurrent with Criterion A of schizophrenia. B. Delusions or hallucinations for 2 or more weeks in the absence of a major mood episode during the lifetime duration of the illness. C. Symptoms that meet criteria for a major mood episode are present for the majority of the total duration of the active and residual portions of the illness. D. The disturbance is not attributable to the effects of a substance or another medical condition.'
    },
    {
        code: 'F22',
        name: 'Delusional Disorder',
        category: 'Psychotic Disorders',
        key_symptoms: JSON.stringify([
            'One or more delusions with a duration of 1 month or longer',
            'Criterion A for schizophrenia has never been met',
            'Apart from the impact of the delusion(s), functioning is not markedly impaired',
            'Behavior is not obviously bizarre or odd',
            'If manic or major depressive episodes have occurred, these have been brief relative to the delusional periods'
        ]),
        full_criteria: 'A. The presence of one (or more) delusions with a duration of 1 month or longer. B. Criterion A for schizophrenia has never been met. Note: Hallucinations, if present, are not prominent and are related to the delusional theme. C. Apart from the impact of the delusion(s) or its ramifications, functioning is not markedly impaired, and behavior is not obviously bizarre or odd. D. If manic or major depressive episodes have occurred, these have been brief relative to the duration of the delusional periods.'
    },
    {
        code: 'F23',
        name: 'Brief Psychotic Disorder',
        category: 'Psychotic Disorders',
        key_symptoms: JSON.stringify([
            'Presence of one or more psychotic symptoms: delusions, hallucinations, disorganized speech, or grossly disorganized or catatonic behavior',
            'Duration of an episode is at least 1 day but less than 1 month',
            'Eventual full return to premorbid level of functioning',
            'Not attributable to another psychotic disorder, substance, or medical condition'
        ]),
        full_criteria: 'A. Presence of one (or more) of the following symptoms. At least one of these must be (1), (2), or (3): 1. Delusions. 2. Hallucinations. 3. Disorganized speech. 4. Grossly disorganized or catatonic behavior. B. Duration of an episode of the disturbance is at least 1 day but less than 1 month, with eventual full return to premorbid level of functioning. C. The disturbance is not better explained by major depressive or bipolar disorder with psychotic features, or another psychotic disorder, and is not attributable to the physiological effects of a substance or another medical condition.'
    },
    {
        code: 'F20.81',
        name: 'Schizophreniform Disorder',
        category: 'Psychotic Disorders',
        key_symptoms: JSON.stringify([
            'Delusions, hallucinations, disorganized speech, disorganized or catatonic behavior, or negative symptoms',
            'An episode of the disorder lasts at least 1 month but less than 6 months',
            'Schizoaffective disorder and depressive or bipolar disorder with psychotic features have been ruled out'
        ]),
        full_criteria: 'A. Two (or more) of the following, each present for a significant portion of time during a 1-month period. At least one must be (1), (2), or (3): 1. Delusions. 2. Hallucinations. 3. Disorganized speech. 4. Grossly disorganized or catatonic behavior. 5. Negative symptoms. B. An episode of the disorder lasts at least 1 month but less than 6 months. C. Schizoaffective disorder and depressive or bipolar disorder with psychotic features have been ruled out.'
    },

    // ===== PERSONALITY DISORDERS =====
    {
        code: 'F60.3',
        name: 'Borderline Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Frantic efforts to avoid real or imagined abandonment',
            'Pattern of unstable and intense interpersonal relationships',
            'Identity disturbance: markedly unstable self-image or sense of self',
            'Impulsivity in at least two areas that are potentially self-damaging',
            'Recurrent suicidal behavior, gestures, threats, or self-mutilating behavior',
            'Affective instability due to marked reactivity of mood',
            'Chronic feelings of emptiness',
            'Inappropriate, intense anger',
            'Transient, stress-related paranoid ideation or severe dissociative symptoms'
        ]),
        full_criteria: 'A pervasive pattern of instability of interpersonal relationships, self-image, and affects, and marked impulsivity, beginning by early adulthood and present in a variety of contexts, as indicated by five (or more) of the following: 1. Frantic efforts to avoid abandonment. 2. Unstable and intense relationships. 3. Identity disturbance. 4. Impulsivity. 5. Recurrent suicidal behavior or self-mutilation. 6. Affective instability. 7. Chronic emptiness. 8. Inappropriate intense anger. 9. Transient paranoid ideation or dissociative symptoms.'
    },
    {
        code: 'F60.2',
        name: 'Antisocial Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Failure to conform to social norms with respect to lawful behaviors',
            'Deceitfulness, as indicated by repeated lying or conning others',
            'Impulsivity or failure to plan ahead',
            'Irritability and aggressiveness, as indicated by repeated physical fights or assaults',
            'Reckless disregard for safety of self or others',
            'Consistent irresponsibility',
            'Lack of remorse'
        ]),
        full_criteria: 'A. A pervasive pattern of disregard for and violation of the rights of others, occurring since age 15 years, as indicated by three (or more) of the following: 1. Failure to conform to social norms. 2. Deceitfulness. 3. Impulsivity. 4. Irritability and aggressiveness. 5. Reckless disregard for safety. 6. Consistent irresponsibility. 7. Lack of remorse. B. The individual is at least age 18 years. C. There is evidence of conduct disorder with onset before age 15 years.'
    },
    {
        code: 'F60.0',
        name: 'Paranoid Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Suspects, without sufficient basis, that others are exploiting, harming, or deceiving',
            'Preoccupied with unjustified doubts about the loyalty of friends or associates',
            'Reluctant to confide in others because of unwarranted fear',
            'Reads hidden demeaning or threatening meanings into benign remarks',
            'Persistently bears grudges',
            'Perceives attacks on character that are not apparent to others and is quick to react angrily',
            'Has recurrent suspicions regarding fidelity of spouse or partner'
        ]),
        full_criteria: 'A. A pervasive distrust and suspiciousness of others such that their motives are interpreted as malevolent, beginning by early adulthood and present in a variety of contexts, as indicated by four (or more) of the following: suspects others of exploitation, doubts loyalty of friends, reluctance to confide, reads hidden meanings into benign remarks, bears grudges, perceives attacks on character, suspicious of spouse/partner fidelity.'
    },
    {
        code: 'F60.1',
        name: 'Schizoid Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Neither desires nor enjoys close relationships, including being part of a family',
            'Almost always chooses solitary activities',
            'Little interest in having sexual experiences with another person',
            'Takes pleasure in few, if any, activities',
            'Lacks close friends or confidants other than first-degree relatives',
            'Appears indifferent to the praise or criticism of others',
            'Shows emotional coldness, detachment, or flattened affectivity'
        ]),
        full_criteria: 'A. A pervasive pattern of detachment from social relationships and a restricted range of expression of emotions in interpersonal settings, beginning by early adulthood and present in a variety of contexts, as indicated by four (or more) of the following: neither desires nor enjoys close relationships, chooses solitary activities, little interest in sexual experiences, takes pleasure in few activities, lacks close friends, indifferent to praise or criticism, emotional coldness or detachment.'
    },
    {
        code: 'F21',
        name: 'Schizotypal Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Ideas of reference (excluding delusions of reference)',
            'Odd beliefs or magical thinking that influences behavior',
            'Unusual perceptual experiences, including bodily illusions',
            'Odd thinking and speech',
            'Suspiciousness or paranoid ideation',
            'Inappropriate or constricted affect',
            'Behavior or appearance that is odd, eccentric, or peculiar',
            'Lack of close friends or confidants',
            'Excessive social anxiety that does not diminish with familiarity'
        ]),
        full_criteria: 'A pervasive pattern of social and interpersonal deficits marked by acute discomfort with, and reduced capacity for, close relationships as well as by cognitive or perceptual distortions and eccentricities of behavior, beginning by early adulthood and present in a variety of contexts, as indicated by five (or more) of the following.'
    },
    {
        code: 'F60.4',
        name: 'Histrionic Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Uncomfortable when not the center of attention',
            'Interaction often characterized by inappropriate sexually seductive or provocative behavior',
            'Displays rapidly shifting and shallow expression of emotions',
            'Consistently uses physical appearance to draw attention to self',
            'Style of speech that is excessively impressionistic and lacking in detail',
            'Shows self-dramatization, theatricality, and exaggerated expression of emotion',
            'Is suggestible (easily influenced by others)',
            'Considers relationships to be more intimate than they actually are'
        ]),
        full_criteria: 'A pervasive pattern of excessive emotionality and attention seeking, beginning by early adulthood and present in a variety of contexts, as indicated by five (or more) of the following.'
    },
    {
        code: 'F60.81',
        name: 'Narcissistic Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Grandiose sense of self-importance',
            'Preoccupied with fantasies of unlimited success, power, brilliance, beauty, or ideal love',
            'Believes he or she is "special" and unique',
            'Requires excessive admiration',
            'Has a sense of entitlement',
            'Interpersonally exploitative',
            'Lacks empathy',
            'Often envious of others or believes others are envious of them',
            'Shows arrogant, haughty behaviors or attitudes'
        ]),
        full_criteria: 'A pervasive pattern of grandiosity (in fantasy or behavior), need for admiration, and lack of empathy, beginning by early adulthood and present in a variety of contexts, as indicated by five (or more) of the following.'
    },
    {
        code: 'F60.6',
        name: 'Avoidant Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Avoids occupational activities that involve significant interpersonal contact due to fears of criticism, disapproval, or rejection',
            'Unwilling to get involved with people unless certain of being liked',
            'Shows restraint within intimate relationships because of fear of being shamed or ridiculed',
            'Preoccupied with being criticized or rejected in social situations',
            'Inhibited in new interpersonal situations because of feelings of inadequacy',
            'Views self as socially inept, personally unappealing, or inferior to others',
            'Unusually reluctant to take personal risks or engage in new activities'
        ]),
        full_criteria: 'A pervasive pattern of social inhibition, feelings of inadequacy, and hypersensitivity to negative evaluation, beginning by early adulthood and present in a variety of contexts, as indicated by four (or more) of the following.'
    },
    {
        code: 'F60.7',
        name: 'Dependent Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Difficulty making everyday decisions without excessive amount of advice and reassurance from others',
            'Needs others to assume responsibility for most major areas of life',
            'Difficulty expressing disagreement because of fear of loss of support or approval',
            'Difficulty initiating projects or doing things on own',
            'Goes to excessive lengths to obtain nurturance and support from others',
            'Feels uncomfortable or helpless when alone',
            'Urgently seeks another relationship when a close relationship ends',
            'Unrealistically preoccupied with fears of being left to take care of oneself'
        ]),
        full_criteria: 'A pervasive and excessive need to be taken care of that leads to submissive and clinging behavior and fears of separation, beginning by early adulthood and present in a variety of contexts, as indicated by five (or more) of the following.'
    },
    {
        code: 'F60.5',
        name: 'Obsessive-Compulsive Personality Disorder',
        category: 'Personality Disorders',
        key_symptoms: JSON.stringify([
            'Preoccupied with details, rules, lists, order, organization, or schedules to the extent that the major point of the activity is lost',
            'Shows perfectionism that interferes with task completion',
            'Excessively devoted to work and productivity to the exclusion of leisure activities and friendships',
            'Overconscientious, scrupulous, and inflexible about matters of morality or ethics',
            'Unable to discard worn-out or worthless objects',
            'Reluctant to delegate tasks or to work with others',
            'Adopts a miserly spending style',
            'Shows rigidity and stubbornness'
        ]),
        full_criteria: 'A pervasive pattern of preoccupation with orderliness, perfectionism, and mental and interpersonal control, at the expense of flexibility, openness, and efficiency, beginning by early adulthood and present in a variety of contexts, as indicated by four (or more) of the following.'
    },

    // ===== TRAUMA & STRESS-RELATED DISORDERS =====
    {
        code: 'F43.10',
        name: 'Post-Traumatic Stress Disorder (PTSD)',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Intrusive memories or flashbacks of the traumatic event',
            'Distressing dreams related to the trauma',
            'Dissociative reactions (e.g., flashbacks) in which the individual feels or acts as if the event were recurring',
            'Intense or prolonged psychological distress at exposure to cues resembling the trauma',
            'Avoidance of distressing memories, thoughts, or feelings about the traumatic event',
            'Avoidance of external reminders that arouse distressing memories',
            'Negative alterations in cognitions and mood',
            'Marked alterations in arousal and reactivity (hypervigilance, exaggerated startle response)'
        ]),
        full_criteria: 'A. Exposure to actual or threatened death, serious injury, or sexual violence in one or more ways: directly experiencing, witnessing, learning about a close family member or friend, or experiencing repeated exposure to aversive details. B. Presence of one or more intrusion symptoms. C. Persistent avoidance of stimuli associated with the traumatic event(s). D. Negative alterations in cognitions and mood. E. Marked alterations in arousal and reactivity. F. Duration of the disturbance is more than 1 month. G. The disturbance causes clinically significant distress or impairment in functioning.'
    },
    {
        code: 'F43.0',
        name: 'Acute Stress Disorder',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Intrusion symptoms (recurrent, involuntary, and intrusive distressing memories)',
            'Negative mood (persistent inability to experience positive emotions)',
            'Dissociative symptoms (altered sense of reality, inability to remember important aspects of the event)',
            'Avoidance symptoms (efforts to avoid distressing memories or external reminders)',
            'Arousal symptoms (sleep disturbance, irritable behavior, hypervigilance, difficulty concentrating, exaggerated startle response)',
            'Duration is 3 days to 1 month after trauma exposure'
        ]),
        full_criteria: 'A. Exposure to actual or threatened death, serious injury, or sexual violence. B. Presence of nine (or more) symptoms from any of the five categories of intrusion, negative mood, dissociation, avoidance, and arousal, beginning or worsening after the traumatic event(s). C. Duration of the disturbance is 3 days to 1 month after trauma exposure. D. The disturbance causes clinically significant distress or impairment.'
    },
    {
        code: 'F43.20',
        name: 'Adjustment Disorder, Unspecified',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Emotional or behavioral symptoms in response to an identifiable stressor within 3 months of the onset of the stressor',
            'Marked distress that is out of proportion to the severity of the stressor',
            'Significant impairment in social, occupational, or other important areas of functioning',
            'Does not meet criteria for another mental disorder',
            'Symptoms do not persist for more than an additional 6 months after the stressor has terminated'
        ]),
        full_criteria: 'A. The development of emotional or behavioral symptoms in response to an identifiable stressor(s) occurring within 3 months of the onset of the stressor(s). B. These symptoms or behaviors are clinically significant, as evidenced by one or both of the following: marked distress out of proportion to the stressor, significant impairment in functioning. C. The stress-related disturbance does not meet the criteria for another mental disorder. D. The symptoms do not represent normal bereavement. E. Once the stressor or its consequences have terminated, the symptoms do not persist for more than an additional 6 months.'
    },
    {
        code: 'F43.21',
        name: 'Adjustment Disorder with Depressed Mood',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Low mood, tearfulness, or feelings of hopelessness in response to a stressor',
            'Symptoms develop within 3 months of the onset of the stressor',
            'Distress is out of proportion to the severity of the stressor',
            'Does not meet criteria for major depressive disorder'
        ]),
        full_criteria: 'The predominant manifestation is low mood, tearfulness, or feelings of hopelessness, developing within 3 months of an identifiable stressor and not meeting criteria for another specific mental disorder.'
    },
    {
        code: 'F43.22',
        name: 'Adjustment Disorder with Anxiety',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Nervousness, worry, or jitteriness in response to a stressor',
            'Symptoms develop within 3 months of the onset of the stressor',
            'Distress is out of proportion to the severity of the stressor',
            'Does not meet criteria for an anxiety disorder'
        ]),
        full_criteria: 'The predominant manifestation is nervousness, worry, jitteriness, or separation anxiety, developing within 3 months of an identifiable stressor and not meeting criteria for another specific mental disorder.'
    },
    {
        code: 'F94.1',
        name: 'Reactive Attachment Disorder',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Consistent pattern of inhibited, emotionally withdrawn behavior toward adult caregivers',
            'Rarely or minimally seeks comfort when distressed',
            'Rarely or minimally responds to comfort when distressed',
            'Persistent social and emotional disturbance (minimal social and emotional responsiveness, limited positive affect, or episodes of unexplained irritability, sadness, or fearfulness)',
            'The child has experienced a pattern of extremes of insufficient care'
        ]),
        full_criteria: 'A. A consistent pattern of inhibited, emotionally withdrawn behavior toward adult caregivers, manifested by both: rarely seeks comfort and rarely responds to comfort when distressed. B. A persistent social and emotional disturbance. C. The child has experienced a pattern of extremes of insufficient care. D. The care in Criterion C is presumed to be responsible for the disturbed behavior in Criterion A. E. Criteria are not met for autism spectrum disorder. F. The disturbance is evident before age 5 years. G. The child has a developmental age of at least 9 months.'
    },
    {
        code: 'F94.2',
        name: 'Disinhibited Social Engagement Disorder',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'A pattern of behavior in which a child actively approaches and interacts with unfamiliar adults',
            'Reduced or absent reticence in approaching unfamiliar adults',
            'Overly familiar verbal or physical behavior',
            'Diminished or absent checking back with adult caregiver after venturing away',
            'Willingness to go off with an unfamiliar adult with minimal or no hesitation'
        ]),
        full_criteria: 'A. A pattern of behavior in which a child actively approaches and interacts with unfamiliar adults and exhibits at least two of the following: reduced or absent reticence, overly familiar behavior, diminished checking back, willingness to go with strangers. B. The behaviors in Criterion A are not limited to impulsivity but include socially disinhibited behavior. C. The child has experienced a pattern of extremes of insufficient care. D. The care in Criterion C is presumed to be responsible for the disturbed behavior. E. The child has a developmental age of at least 9 months.'
    },

    // ===== OBSESSIVE-COMPULSIVE AND RELATED DISORDERS =====
    {
        code: 'F42.2',
        name: 'Obsessive-Compulsive Disorder (OCD)',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Presence of obsessions (recurrent and persistent thoughts, urges, or images that are intrusive and unwanted)',
            'Presence of compulsions (repetitive behaviors or mental acts performed in response to an obsession)',
            'The obsessions or compulsions are time-consuming (e.g., take more than 1 hour per day)',
            'Cause clinically significant distress or impairment in functioning'
        ]),
        full_criteria: 'A. Presence of obsessions, compulsions, or both. Obsessions are defined as recurrent and persistent thoughts, urges, or images that are experienced as intrusive and unwanted. Compulsions are defined as repetitive behaviors or mental acts that the individual feels driven to perform in response to an obsession or according to rules that must be applied rigidly. B. The obsessions or compulsions are time-consuming or cause clinically significant distress or impairment. C. Not attributable to the physiological effects of a substance or another medical condition.'
    },
    {
        code: 'F45.22',
        name: 'Body Dysmorphic Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Preoccupation with one or more perceived defects or flaws in physical appearance that are not observable or appear slight to others',
            'Repetitive behaviors (mirror checking, excessive grooming, skin picking, reassurance seeking)',
            'Repetitive mental acts (comparing appearance with that of others) in response to the appearance concerns',
            'The preoccupation causes clinically significant distress or impairment'
        ]),
        full_criteria: 'A. Preoccupation with one or more perceived defects or flaws in physical appearance that are not observable or appear slight to others. B. At some point during the course of the disorder, the individual has performed repetitive behaviors or mental acts in response to the appearance concerns. C. The preoccupation causes clinically significant distress or impairment in social, occupational, or other important areas of functioning. D. The appearance preoccupation is not better explained by concerns with body fat or weight in an individual meeting diagnostic criteria for an eating disorder.'
    },
    {
        code: 'F63.3',
        name: 'Trichotillomania (Hair-Pulling Disorder)',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Recurrent pulling out of one\'s hair, resulting in hair loss',
            'Repeated attempts to decrease or stop hair pulling',
            'The hair pulling causes clinically significant distress or impairment'
        ]),
        full_criteria: 'A. Recurrent pulling out of one\'s hair, resulting in hair loss. B. Repeated attempts to decrease or stop hair pulling. C. The hair pulling causes clinically significant distress or impairment in social, occupational, or other important areas of functioning. D. The hair pulling or hair loss is not attributable to another medical condition. E. The hair pulling is not better explained by the symptoms of another mental disorder.'
    },
    {
        code: 'L98.1',
        name: 'Excoriation (Skin-Picking) Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Recurrent skin picking resulting in skin lesions',
            'Repeated attempts to decrease or stop skin picking',
            'The skin picking causes clinically significant distress or impairment'
        ]),
        full_criteria: 'A. Recurrent skin picking resulting in skin lesions. B. Repeated attempts to decrease or stop skin picking. C. The skin picking causes clinically significant distress or impairment in social, occupational, or other important areas of functioning. D. The skin picking is not attributable to the physiological effects of a substance or another medical condition. E. The skin picking is not better explained by symptoms of another mental disorder.'
    },

    // ===== NEURODEVELOPMENTAL DISORDERS =====
    {
        code: 'F84.0',
        name: 'Autism Spectrum Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Persistent deficits in social communication and social interaction across multiple contexts',
            'Deficits in social-emotional reciprocity',
            'Deficits in nonverbal communicative behaviors used for social interaction',
            'Deficits in developing, maintaining, and understanding relationships',
            'Restricted, repetitive patterns of behavior, interests, or activities',
            'Insistence on sameness, inflexible adherence to routines',
            'Highly restricted, fixated interests that are abnormal in intensity or focus',
            'Hyper- or hyporeactivity to sensory input'
        ]),
        full_criteria: 'A. Persistent deficits in social communication and social interaction across multiple contexts. B. Restricted, repetitive patterns of behavior, interests, or activities, as manifested by at least two of the following: stereotyped or repetitive motor movements, insistence on sameness, highly restricted fixated interests, hyper- or hyporeactivity to sensory input. C. Symptoms must be present in the early developmental period. D. Symptoms cause clinically significant impairment. E. These disturbances are not better explained by intellectual developmental disorder or global developmental delay.'
    },
    {
        code: 'F90.0',
        name: 'Attention-Deficit/Hyperactivity Disorder (ADHD), Predominantly Inattentive',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Often fails to give close attention to details or makes careless mistakes',
            'Often has difficulty sustaining attention in tasks or play activities',
            'Often does not seem to listen when spoken to directly',
            'Often does not follow through on instructions and fails to finish tasks',
            'Often has difficulty organizing tasks and activities',
            'Often avoids or is reluctant to engage in tasks requiring sustained mental effort',
            'Often loses things necessary for tasks and activities',
            'Often easily distracted by extraneous stimuli',
            'Often forgetful in daily activities'
        ]),
        full_criteria: 'A. A persistent pattern of inattention and/or hyperactivity-impulsivity that interferes with functioning or development. Six (or more) symptoms of inattention for children up to age 16, or five or more for adolescents 17 and older and adults. B. Several inattentive symptoms were present prior to age 12 years. C. Several symptoms are present in two or more settings. D. There is clear evidence that the symptoms interfere with functioning. E. The symptoms do not occur exclusively during the course of schizophrenia or another psychotic disorder.'
    },
    {
        code: 'F90.1',
        name: 'Attention-Deficit/Hyperactivity Disorder (ADHD), Predominantly Hyperactive-Impulsive',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Often fidgets with or taps hands or feet or squirms in seat',
            'Often leaves seat in situations when remaining seated is expected',
            'Often runs about or climbs in situations where it is inappropriate',
            'Often unable to play or engage in leisure activities quietly',
            'Often "on the go," acting as if "driven by a motor"',
            'Often talks excessively',
            'Often blurts out an answer before a question has been completed',
            'Often has difficulty waiting their turn',
            'Often interrupts or intrudes on others'
        ]),
        full_criteria: 'A. A persistent pattern of inattention and/or hyperactivity-impulsivity that interferes with functioning or development. Six (or more) symptoms of hyperactivity-impulsivity for children up to age 16, or five or more for adolescents 17 and older and adults. B. Several hyperactive-impulsive symptoms were present prior to age 12 years. C. Several symptoms are present in two or more settings. D. There is clear evidence that the symptoms interfere with functioning.'
    },
    {
        code: 'F90.2',
        name: 'Attention-Deficit/Hyperactivity Disorder (ADHD), Combined Presentation',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Symptoms of both inattention and hyperactivity-impulsivity are present',
            'Fails to give close attention to details',
            'Difficulty sustaining attention',
            'Fidgeting, leaving seat, running or climbing inappropriately',
            'Talks excessively, difficulty waiting turn',
            'Several symptoms present before age 12',
            'Symptoms present in two or more settings'
        ]),
        full_criteria: 'Both inattention and hyperactivity-impulsivity criteria are met. Six (or more) symptoms from each domain for children up to age 16 years, or five or more for adolescents 17 and older and adults, have persisted for at least 6 months.'
    },

    // ===== EATING DISORDERS =====
    {
        code: 'F50.01',
        name: 'Anorexia Nervosa, Restricting Type',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Restriction of energy intake relative to requirements, leading to significantly low body weight',
            'Intense fear of gaining weight or of becoming fat, or persistent behavior that interferes with weight gain',
            'Disturbance in the way body weight or shape is experienced',
            'Undue influence of body weight or shape on self-evaluation',
            'Persistent lack of recognition of the seriousness of the current low body weight'
        ]),
        full_criteria: 'A. Restriction of energy intake relative to requirements, leading to a significantly low body weight in the context of age, sex, developmental trajectory, and physical health. B. Intense fear of gaining weight or of becoming fat, or persistent behavior that interferes with weight gain, even though at a significantly low weight. C. Disturbance in the way in which one\'s body weight or shape is experienced, undue influence of body weight or shape on self-evaluation, or persistent lack of recognition of the seriousness of the current low body weight. Restricting type: weight loss accomplished primarily through dieting, fasting, and/or excessive exercise.'
    },
    {
        code: 'F50.02',
        name: 'Anorexia Nervosa, Binge-Eating/Purging Type',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Restriction of energy intake leading to significantly low body weight',
            'Recurrent episodes of binge eating or purging behavior (self-induced vomiting, misuse of laxatives, diuretics, or enemas)',
            'Intense fear of gaining weight',
            'Disturbance in body image'
        ]),
        full_criteria: 'Meets criteria for anorexia nervosa. During the last 3 months, the individual has engaged in recurrent episodes of binge eating or purging behavior (i.e., self-induced vomiting or the misuse of laxatives, diuretics, or enemas).'
    },
    {
        code: 'F50.2',
        name: 'Bulimia Nervosa',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Recurrent episodes of binge eating (eating a large amount of food in a discrete period of time with a sense of lack of control)',
            'Recurrent inappropriate compensatory behaviors (self-induced vomiting, misuse of laxatives, fasting, excessive exercise)',
            'The binge eating and compensatory behaviors both occur at least once a week for 3 months',
            'Self-evaluation is unduly influenced by body shape and weight'
        ]),
        full_criteria: 'A. Recurrent episodes of binge eating, characterized by both: eating in a discrete period of time an amount of food that is definitely larger than what most individuals would eat, and a sense of lack of control over eating during the episode. B. Recurrent inappropriate compensatory behaviors in order to prevent weight gain. C. The binge eating and inappropriate compensatory behaviors both occur, on average, at least once a week for 3 months. D. Self-evaluation is unduly influenced by body shape and weight. E. The disturbance does not occur exclusively during episodes of anorexia nervosa.'
    },
    {
        code: 'F50.81',
        name: 'Binge-Eating Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Recurrent episodes of binge eating',
            'Eating much more rapidly than normal',
            'Eating until feeling uncomfortably full',
            'Eating large amounts of food when not feeling physically hungry',
            'Eating alone because of feeling embarrassed by how much one is eating',
            'Feeling disgusted with oneself, depressed, or very guilty afterward',
            'Marked distress regarding binge eating'
        ]),
        full_criteria: 'A. Recurrent episodes of binge eating. B. The binge-eating episodes are associated with three (or more) of the following: eating more rapidly than normal, eating until feeling uncomfortably full, eating large amounts when not hungry, eating alone because of embarrassment, feeling disgusted, depressed, or guilty afterward. C. Marked distress regarding binge eating is present. D. The binge eating occurs, on average, at least once a week for 3 months. E. The binge eating is not associated with the recurrent use of inappropriate compensatory behavior as in bulimia nervosa.'
    },

    // ===== DISSOCIATIVE DISORDERS =====
    {
        code: 'F44.81',
        name: 'Dissociative Identity Disorder',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Disruption of identity characterized by two or more distinct personality states',
            'Recurrent gaps in the recall of everyday events, important personal information, and/or traumatic events',
            'The symptoms cause clinically significant distress or impairment',
            'The disturbance is not a normal part of a broadly accepted cultural or religious practice'
        ]),
        full_criteria: 'A. Disruption of identity characterized by two or more distinct personality states, which may be described in some cultures as an experience of possession. The disruption in identity involves marked discontinuity in sense of self and sense of agency, accompanied by related alterations in affect, behavior, consciousness, memory, perception, cognition, and/or sensory-motor functioning. B. Recurrent gaps in the recall of everyday events, important personal information, and/or traumatic events that are inconsistent with ordinary forgetting. C. The symptoms cause clinically significant distress or impairment. D. Not a normal part of cultural or religious practice. E. Not attributable to substance effects.'
    },
    {
        code: 'F48.1',
        name: 'Depersonalization/Derealization Disorder',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Persistent or recurrent experiences of depersonalization (feeling detached from one\'s mental processes or body, as if an outside observer)',
            'Persistent or recurrent experiences of derealization (experiences of unreality or detachment with respect to surroundings)',
            'During the depersonalization or derealization experiences, reality testing remains intact',
            'The symptoms cause clinically significant distress or impairment'
        ]),
        full_criteria: 'A. The presence of persistent or recurrent experiences of depersonalization, derealization, or both: Depersonalization: Experiences of unreality, detachment, or being an outside observer with respect to one\'s thoughts, feelings, sensations, body, or actions. Derealization: Experiences of unreality or detachment with respect to surroundings. B. During the depersonalization or derealization experiences, reality testing remains intact. C. The symptoms cause clinically significant distress or impairment. D. Not attributable to substance effects or another medical or mental disorder.'
    },
    {
        code: 'F44.0',
        name: 'Dissociative Amnesia',
        category: 'Trauma & Stress',
        key_symptoms: JSON.stringify([
            'Inability to recall important autobiographical information, usually of a traumatic or stressful nature',
            'The memory loss is inconsistent with ordinary forgetting',
            'The symptoms cause clinically significant distress or impairment',
            'Not attributable to substance effects or a neurological or other medical condition'
        ]),
        full_criteria: 'A. An inability to recall important autobiographical information, usually of a traumatic or stressful nature, that is inconsistent with ordinary forgetting. B. The symptoms cause clinically significant distress or impairment in social, occupational, or other important areas of functioning. C. The disturbance is not attributable to the physiological effects of a substance or a neurological or other medical condition. D. The disturbance is not better explained by dissociative identity disorder, PTSD, acute stress disorder, somatic symptom disorder, or major or mild neurocognitive disorder.'
    },

    // ===== SUBSTANCE-RELATED AND ADDICTIVE DISORDERS =====
    {
        code: 'F10.20',
        name: 'Alcohol Use Disorder, Moderate',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Alcohol is often taken in larger amounts or over a longer period than was intended',
            'Persistent desire or unsuccessful efforts to cut down or control alcohol use',
            'A great deal of time is spent in activities necessary to obtain, use, or recover from alcohol effects',
            'Craving, or a strong desire or urge to use alcohol',
            'Recurrent alcohol use resulting in failure to fulfill major role obligations',
            'Continued alcohol use despite having persistent social or interpersonal problems',
            'Tolerance (need for markedly increased amounts or diminished effect)',
            'Withdrawal symptoms when alcohol use is reduced or stopped'
        ]),
        full_criteria: 'A problematic pattern of alcohol use leading to clinically significant impairment or distress, as manifested by at least 4-5 of 11 criteria occurring within a 12-month period. Moderate severity: 4-5 symptoms present.'
    },
    {
        code: 'F12.20',
        name: 'Cannabis Use Disorder, Moderate',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Cannabis is often taken in larger amounts or over a longer period than was intended',
            'Persistent desire or unsuccessful efforts to cut down or control cannabis use',
            'Craving, or a strong desire or urge to use cannabis',
            'Recurrent cannabis use resulting in failure to fulfill major role obligations',
            'Continued use despite persistent social or interpersonal problems',
            'Important social, occupational, or recreational activities are given up or reduced',
            'Tolerance and/or withdrawal'
        ]),
        full_criteria: 'A problematic pattern of cannabis use leading to clinically significant impairment or distress, as manifested by at least 4-5 of 11 criteria occurring within a 12-month period.'
    },
    {
        code: 'F11.20',
        name: 'Opioid Use Disorder, Moderate',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify([
            'Opioids are often taken in larger amounts or over a longer period than was intended',
            'Persistent desire or unsuccessful efforts to cut down or control opioid use',
            'Craving, or a strong desire or urge to use opioids',
            'Continued opioid use despite having persistent or recurrent social or interpersonal problems',
            'Tolerance and/or withdrawal',
            'Recurrent opioid use in situations in which it is physically hazardous'
        ]),
        full_criteria: 'A problematic pattern of opioid use leading to clinically significant impairment or distress, as manifested by at least 4-5 of 11 criteria occurring within a 12-month period.'
    },

    // ===== SLEEP-WAKE DISORDERS =====
    {
        code: 'G47.00',
        name: 'Insomnia Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Predominant complaint of dissatisfaction with sleep quantity or quality',
            'Difficulty initiating sleep',
            'Difficulty maintaining sleep (frequent awakenings or problems returning to sleep)',
            'Early-morning awakening with inability to return to sleep',
            'The sleep difficulty occurs at least 3 nights per week for at least 3 months',
            'The sleep difficulty causes clinically significant distress or impairment'
        ]),
        full_criteria: 'A. A predominant complaint of dissatisfaction with sleep quantity or quality, associated with one (or more) of the following: difficulty initiating sleep, difficulty maintaining sleep, early-morning awakening. B. The sleep disturbance causes clinically significant distress or impairment. C. The sleep difficulty occurs at least 3 nights per week. D. The sleep difficulty is present for at least 3 months. E. The sleep difficulty occurs despite adequate opportunity for sleep. F. Not better explained by another sleep-wake disorder. G. Not attributable to the physiological effects of a substance.'
    },

    // ===== SOMATIC SYMPTOM AND RELATED DISORDERS =====
    {
        code: 'F45.1',
        name: 'Somatic Symptom Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'One or more somatic symptoms that are distressing or result in significant disruption of daily life',
            'Excessive thoughts, feelings, or behaviors related to the somatic symptoms',
            'Disproportionate and persistent thoughts about the seriousness of one\'s symptoms',
            'Persistently high level of anxiety about health or symptoms',
            'Excessive time and energy devoted to these symptoms or health concerns'
        ]),
        full_criteria: 'A. One or more somatic symptoms that are distressing or result in significant disruption of daily life. B. Excessive thoughts, feelings, or behaviors related to the somatic symptoms or associated health concerns as manifested by at least one of the following: disproportionate and persistent thoughts about the seriousness of one\'s symptoms, persistently high level of anxiety about health or symptoms, excessive time and energy devoted to these symptoms or health concerns. C. Although any one somatic symptom may not be continuously present, the state of being symptomatic is persistent (typically more than 6 months).'
    },
    {
        code: 'F45.21',
        name: 'Illness Anxiety Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify([
            'Preoccupation with having or acquiring a serious illness',
            'Somatic symptoms are not present or, if present, are only mild in intensity',
            'High level of anxiety about health, easily alarmed about personal health status',
            'Excessive health-related behaviors (e.g., repeatedly checking body for signs of illness)',
            'The illness preoccupation has been present for at least 6 months'
        ]),
        full_criteria: 'A. Preoccupation with having or acquiring a serious illness. B. Somatic symptoms are not present or, if present, are only mild in intensity. C. There is a high level of anxiety about health, and the individual is easily alarmed about personal health status. D. The individual performs excessive health-related behaviors or exhibits maladaptive avoidance. E. Illness preoccupation has been present for at least 6 months. F. Not better explained by another mental disorder.'
    }
];

async function seed() {
    try {
        console.log('Seeding DSM-5 disorders...');
        for (const disorder of disorders) {
            await db.query(
                `INSERT INTO dsm5_disorders (code, name, category, key_symptoms, full_criteria)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (code) DO UPDATE SET
                 name = EXCLUDED.name,
                 category = EXCLUDED.category,
                 key_symptoms = EXCLUDED.key_symptoms,
                 full_criteria = EXCLUDED.full_criteria`,
                [disorder.code, disorder.name, disorder.category, disorder.key_symptoms, disorder.full_criteria]
            );
        }
        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding DSM-5 data:', err);
        process.exit(1);
    }
}

seed();
