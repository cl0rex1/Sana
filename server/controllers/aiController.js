const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    console.log("✅ GEMINI_API_KEY detected. Initializing AI...");
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn("⚠️  GEMINI_API_KEY not found in environment variables.");
  }
} catch (error) {
  console.warn("❌ GoogleGenerativeAI initialization failed:", error.message);
}

const SYSTEM_PROMPT_FACT = `You are a cybersecurity expert. Provide exactly ONE short, engaging, and highly informative fact about cybersecurity, digital hygiene, or internet threats.
IMPORTANT RULES:
- The fact MUST be strictly in the requested language.
- DO NOT wrap the output in markdown code blocks like \`\`\`json.
- Output ONLY valid JSON, exactly matching this schema:
{
  "text": "The fact text",
  "category": "One of: Phishing, Password, Malware, Privacy, General",
  "severity": "One of: low, medium, high, critical",
  "source": "A real cybersecurity organization or report (e.g. Kaspersky, FBI IC3, CERT-KZ)"
} (IMPORTANT: Do not mention AI in text or source)
`;

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

    if (!genAI) {
      return res.status(503).json({ 
        text: "AI service is currently unavailable. Please check the server configuration and configure GEMINI_API_KEY.",
        category: "System",
        severity: "critical"
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_PROMPT_FACT,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(`Generate a cybersecurity fact in ${targetLang}. Focus on real-world data.`);
    const response = await result.response;
    let text = response.text();
    
    // Sanitize response: remove markdown code blocks
    text = text.replace(/^```json\s*|\s*```$/g, '').trim();
    
    try {
      const factData = JSON.parse(text);
      res.status(200).json(factData);
    } catch (parseError) {
      console.error("AI JSON Parse Error. Raw text:", text);
      throw new Error("Parse failed");
    }
  } catch (error) {
    console.error("AI Fact Global Fallback Triggered:", error.message);
    res.status(200).json({
      text: "Cybersecurity is a shared responsibility. Always keep your software updated to protect against known vulnerabilities.",
      category: "General",
      severity: "medium",
      source: "Sana Security Lab"
    });
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

    if (!genAI) {
      return res.status(503).json({ 
        message: "AI service is currently unavailable. Please check GEMINI_API_KEY."
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_PROMPT_SCENARIO,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(`Generate a scenario in ${targetLang}.`);
    const response = await result.response;
    let text = response.text();
    
    // Sanitize response: remove markdown code blocks if present
    text = text.replace(/^```json\s*|\s*```$/g, '').trim();

    const scenarioData = JSON.parse(text);
    // Add unique ID
    scenarioData.id = Date.now().toString();
    res.status(200).json(scenarioData);
  } catch (error) {
    console.error("AI Scenario Generation Error:", error);
    res.status(500).json({ 
      message: "Failed to generate scenario", 
      error: error.message,
      details: error.response?.data || null 
    });
  }
};
