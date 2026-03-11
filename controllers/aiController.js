const { OpenAI } = require('openai');
const PDFDocument = require('pdfkit');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.transcribe = async (req, res) => {
    const { audioUrl } = req.body;

    if (!audioUrl) {
        return res.status(400).json({ message: 'Audio URL is required' });
    }

    try {
        // Implement real transcription logic here (e.g., using Whisper)
        // For now, return an empty state if not implemented
        res.json({
            transcript: "",
            language: "English",
            confidence: 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI Transcription failed' });
    }
};

exports.analyzeSession = async (req, res) => {
    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Analyze the following clinical transcript and provide a structured summary, insights, DSM-5 suggestions, and next steps in JSON format."
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(response.choices[0].message.content));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI Analysis failed' });
    }
};

exports.noteAssistant = async (req, res) => {
    const { content, instruction } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a clinical note assistant. Help the doctor refine their notes based on their instructions."
                },
                {
                    role: "user",
                    content: `Notes: ${content}\nInstruction: ${instruction}`
                }
            ]
        });

        res.json({
            refined_content: response.choices[0].message.content
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI Note Assistant failed' });
    }
};

exports.getDiagnosticSuggestions = async (req, res) => {
    try {
        // Real implementation should fetch from session context
        res.json({
            suggestions: [],
            note: "No suggestions available for this session context."
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching diagnostic suggestions' });
    }
};
exports.getSymptomsReport = async (req, res) => {
    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required for analysis' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a professional clinical psychologist assistant. 
                    Analyze the following session transcript and identify potential DSM-5 symptoms.
                    Format your response as a JSON object:
                    {
                        "suggestions": [
                            {
                                "code": "DSM-5 Code",
                                "name": "Disorder/Symptom Name",
                                "evidence": "Direct quote or observation from transcript"
                            }
                        ],
                        "overall_impression": "Brief summary of clinical presentation"
                    }`
                },
                {
                    role: "user",
                    content: `Analyze this transcript for symptoms: ${transcript}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json(result);
    } catch (err) {
        console.error('AI Symptom Analysis Error:', err);
        res.status(500).json({ message: 'Failed to analyze symptoms' });
    }
};

exports.summarizeSession = async (req, res) => {
    const { notes } = req.body;

    if (!notes) {
        return res.status(400).json({ message: 'Notes are required for summarization' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional clinical assistant. Summarize the following session notes into a structured clinical summary. Focus on key themes, patient concerns, and clinical observations."
                },
                {
                    role: "user",
                    content: notes
                }
            ]
        });

        res.json({
            summary: response.choices[0].message.content
        });
    } catch (err) {
        console.error('AI Summarization Error:', err);
        res.status(500).json({ message: 'Failed to generate summary' });
    }
};

exports.getDsmInsight = async (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms) {
        return res.status(400).json({ message: 'Symptoms/Notes are required for DSM lookup' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Analyze the provided clinical text and identify potential DSM-5 matches.
                    Format your response as a JSON object:
                    {
                        "suggestions": [
                            {
                                "code": "ICD-10 Code",
                                "name": "Disorder Name",
                                "reason": "Brief explanation of why this matches based on the text"
                            }
                        ]
                    }`
                },
                {
                    role: "user",
                    content: symptoms
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json(result);
    } catch (err) {
        console.error('AI DSM Insight Error:', err);
        res.status(500).json({ message: 'Failed to fetch DSM insights' });
    }
};

exports.generateReport = async (req, res) => {
    const { patientName, patientId, summary, dsmMatches } = req.body;

    try {
        const doc = new PDFDocument();

        // Formulate filename
        const filename = `Report_${patientName.replace(/\s+/g, '_')}.pdf`;

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('DynaCare - Clinical Summary', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Patient Name: ${patientName}`);
        doc.text(`Patient ID: ${patientId}`);
        doc.moveDown();

        doc.fontSize(16).text('Clinical AI Summary');
        doc.fontSize(11).text(summary || 'No summary available.');
        doc.moveDown();

        doc.fontSize(16).text('DSM-5 References');
        if (dsmMatches && dsmMatches.length > 0) {
            dsmMatches.forEach(match => {
                doc.fontSize(12).text(`${match.code}: ${match.name}`, { underline: true });
                doc.fontSize(11).text(`Reason: ${match.reason}`);
                doc.moveDown(0.5);
            });
        } else {
            doc.fontSize(11).text('No DSM-5 matches identified.');
        }

        doc.moveDown();
        doc.fontSize(10).text('--- End of Report ---', { align: 'center', color: 'grey' });

        // Finalize the PDF
        doc.end();

    } catch (err) {
        console.error('PDF Generation Error:', err);
        res.status(500).json({ message: 'Failed to generate PDF report' });
    }
};


