const Scenario = require('../models/Scenario');
require('../models/User');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const parseJsonQuietly = (text) => {
  try {
    const candidate = text.replace(/^```json\s*|\s*```$/g, '').trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    return JSON.parse(candidate);
  } catch (error) {
    return null;
  }
};

const moderateScenarioWithAI = async (scenarioData) => {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.warn("OPENROUTER_API_KEY missing, auto-approving for dev");
      return { status: 'approved', feedback: 'Auto-approved.' };
    }

    const systemPrompt = `You are an AI moderator for a cybersecurity training app. A user has submitted a scenario.
Your task is to review it and decide if it should be APPROVED or REJECTED.
Criteria for APPROVAL:
1. It must be related to cybersecurity, digital safety, or privacy.
2. It must have 3 choices, where exactly ONE choice is marked as correct (isCorrect: true).
3. It must not contain profanity, offensive language, or harmful content.
4. It must be logical and make sense.

Reply ONLY with valid JSON:
{
  "status": "approved" | "rejected",
  "feedback": "A short reason explaining why."
}`;

    const userPrompt = `Review this scenario:
Title: ${scenarioData.title}
Desc: ${scenarioData.description}
Choices: ${JSON.stringify(scenarioData.choices, null, 2)}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        },
        timeout: 15000,
      }
    );

    const rawOutput = response.data?.choices?.[0]?.message?.content;
    const parsed = parseJsonQuietly(rawOutput);
    if (parsed && parsed.status) {
      return { status: parsed.status.toLowerCase(), feedback: parsed.feedback || '' };
    }
    
    // Fallback if parsing fails
    return { status: 'rejected', feedback: 'Failed AI verification formatting.' };
  } catch (error) {
    console.error('AI Moderation error:', error.message);
    return { status: 'pending', feedback: 'AI unavailable at the moment. Queued.' };
  }
};

exports.submitScenario = async (req, res) => {
  try {
    const { title, description, category, choices, icon, language } = req.body;
    
    // Auto-approve or moderate
    const moderation = await moderateScenarioWithAI({ title, description, choices });
    
    const newScenario = new Scenario({
      title,
      description,
      category,
      choices,
      icon,
      language: language || 'en',
      creator: req.user._id,
      status: moderation.status,
      aiFeedback: moderation.feedback
    });
    
    await newScenario.save();
    res.status(201).json({ success: true, data: newScenario });
  } catch (error) {
    console.error('Submit scenario error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApprovedScenarios = async (req, res) => {
  try {
    const { lang } = req.query;
    const query = { status: 'approved' };
    if (lang) {
      // Optional: match by language if specified
      query.language = lang === 'kz' || lang === 'kk' ? 'kz' : lang === 'ru' ? 'ru' : 'en';
    }
    const scenarios = await Scenario.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('creator', 'username');
    res.status(200).json({ success: true, data: scenarios });
  } catch (error) {
    console.error('Get approved scenarios error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: scenarios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
