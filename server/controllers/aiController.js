const { GoogleGenAI } = require('@google/genai');

let ai = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (error) {
  console.warn("GoogleGenAI initialization failed. Check your API key.");
}

const SYSTEM_PROMPT_FACT = `You are a cybersecurity expert. Provide exactly ONE short, engaging, and highly informative fact about cybersecurity, digital hygiene, or internet threats.
IMPORTANT RULES:
- The fact MUST be strictly in the requested language.
- DO NOT wrap the output in markdown code blocks like \`\`\`json.
- Output ONLY valid JSON, exactly matching this schema:
{
  "text": "The fact text",
  "category": "One of: Phishing, Password, Malware, Privacy, General",
  "severity": "One of: low, medium, high, critical"
}`;

const SYSTEM_PROMPT_SCENARIO = `You are a cybersecurity training system. Generate ONE realistic, engaging, and challenging daily-life scenario where a user must make a security-related choice.
IMPORTANT RULES:
- The content MUST be strictly in the requested language.
- DO NOT wrap the output in markdown code blocks like \`\`\`json.
- Create 3 choices: 1 undeniably correct/safe choice, 1 tempting but risky choice, and 1 obviously bad choice.
- Output ONLY valid JSON, exactly matching this schema:
{
  "title": "Short catchy title",
  "description": "2-3 sentences describing the scenario",
  "category": "One of: Phishing, Passwords, Network, Social Engineering, Device Security",
  "icon": "A single emoji representing the scenario",
  "choices": [
    {
      "id": "A",
      "text": "Choice text",
      "isCorrect": true/false,
      "feedback": "Why this was the right or wrong choice (1 sentence)"
    },
    ... (total 3 choices)
  ]
}`;

exports.generateFact = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const langNames = {
      ru: 'Russian',
      en: 'English',
      kz: 'Kazakh'
    };
    const targetLang = langNames[lang] || 'English';

    if (!ai) {
      return res.status(503).json({ 
        text: "AI service is currently unavailable. Please check the server configuration and configure GEMINI_API_KEY.",
        category: "System",
        severity: "critical"
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Generate a fact in ${targetLang}.` }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT_FACT,
        responseMimeType: "application/json",
      }
    });

    const factData = JSON.parse(response.text);
    res.status(200).json(factData);
  } catch (error) {
    console.error("AI Fact Generation Error:", error.message || error);
    res.status(500).json({ message: "Failed to generate fact", error: error.message });
  }
};

exports.generateScenario = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const langNames = {
      ru: 'Russian',
      en: 'English',
      kz: 'Kazakh'
    };
    const targetLang = langNames[lang] || 'English';

    if (!ai) {
      return res.status(503).json({ 
        message: "AI service is currently unavailable."
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Generate a scenario in ${targetLang}.` }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT_SCENARIO,
        responseMimeType: "application/json",
      }
    });

    const scenarioData = JSON.parse(response.text);
    // Add unique ID
    scenarioData.id = Date.now().toString();
    res.status(200).json(scenarioData);
  } catch (error) {
    console.error("AI Scenario Generation Error:", error.message || error);
    res.status(500).json({ message: "Failed to generate scenario", error: error.message });
  }
};
