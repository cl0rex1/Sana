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

const sanitizeJsonText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText.replace(/^```json\s*|\s*```$/g, '').trim();
};

const parseModelJson = (rawText) => {
  const text = sanitizeJsonText(rawText);
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  const candidate = start !== -1 && end !== -1 ? text.slice(start, end + 1) : text;
  return JSON.parse(candidate);
};

const getTargetLanguage = (lang) => {
  const langNames = {
    ru: 'Russian',
    en: 'English',
    kz: 'Kazakh',
  };
  return langNames[lang] || 'English';
};

const isDev = process.env.NODE_ENV !== 'production';

const getFallbackScenario = (lang) => {
  const scenarios = {
    ru: {
      title: 'Срочное обновление системы',
      description:
        'Во время работы над важным проектом вы получаете всплывающее окно с просьбой срочно установить обновление безопасности. Окно выглядит почти как системное, но вы не уверены, откуда оно появилось.',
      category: 'Device Security',
      icon: '🛡️',
      choices: [
        {
          id: 'A',
          text: 'Закрыть окно, открыть настройки обновлений вручную и проверить источник уведомления.',
          isCorrect: true,
          feedback: 'Это безопаснее: вы сами проверяете обновление через системные настройки.',
        },
        {
          id: 'B',
          text: 'Нажать кнопку в окне и согласиться на установку, чтобы не тратить время.',
          isCorrect: false,
          feedback: 'Это рискованно: окно может быть поддельным и установить вредоносное ПО.',
        },
        {
          id: 'C',
          text: 'Игнорировать предупреждение и продолжить работу, не проверяя ничего.',
          isCorrect: false,
          feedback: 'Это плохой вариант: уязвимости останутся неисправленными.',
        },
      ],
    },
    kz: {
      title: 'Жүйе жаңартуы',
      description:
        'Маңызды жобамен жұмыс істеп отырғанда, қауіпсіздік жаңартуын орнатуды сұрайтын қалқымалы терезе пайда болады. Ол жүйелік хабарламаға ұқсайды, бірақ қайдан шыққаны белгісіз.',
      category: 'Device Security',
      icon: '🛡️',
      choices: [
        {
          id: 'A',
          text: 'Терезені жауып, жаңартуды баптаулар арқылы қолмен тексеру.',
          isCorrect: true,
          feedback: 'Бұл қауіпсіз: жаңартуды өзіңіз жүйелік баптаулардан тексересіз.',
        },
        {
          id: 'B',
          text: 'Уақыт жоғалтпау үшін терезедегі батырманы басып, орнатуға келісу.',
          isCorrect: false,
          feedback: 'Бұл қауіпті: терезе жалған болуы және зиянды бағдарлама орнатуы мүмкін.',
        },
        {
          id: 'C',
          text: 'Ескертуді елемей, тек жұмыс істей беру.',
          isCorrect: false,
          feedback: 'Бұл жаман таңдау: осалдықтар түзетілмей қалады.',
        },
      ],
    },
    en: {
      title: 'Urgent System Update',
      description:
        'While working on an important project, a popup asks you to install a security update immediately. It looks nearly system-generated, but you are not sure where it came from.',
      category: 'Device Security',
      icon: '🛡️',
      choices: [
        {
          id: 'A',
          text: 'Close the popup, open update settings manually, and verify the source.',
          isCorrect: true,
          feedback: 'This is safer because you verify the update through system settings.',
        },
        {
          id: 'B',
          text: 'Click the popup button and install right away to save time.',
          isCorrect: false,
          feedback: 'This is risky: the popup could be fake and install malware.',
        },
        {
          id: 'C',
          text: 'Ignore the warning and keep working without checking anything.',
          isCorrect: false,
          feedback: 'This is a bad option because vulnerabilities remain unpatched.',
        },
      ],
    },
  };

  return {
    ...scenarios[lang] || scenarios.en,
    id: Date.now().toString(),
  };
};

const callOpenRouterApi = async ({ systemPrompt, userPrompt }) => {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'Sana Cybersecurity Platform',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const rawContent = payload?.choices?.[0]?.message?.content || '';
  return parseModelJson(rawContent);
};

const generateFactViaOpenRouterApi = async (targetLang) => {
  return callOpenRouterApi({
    systemPrompt: SYSTEM_PROMPT_FACT,
    userPrompt: `Generate a cybersecurity fact in ${targetLang}. Focus on real-world data.`,
  });
};

const generateScenarioViaOpenRouterApi = async (targetLang) => {
  return callOpenRouterApi({
    systemPrompt: SYSTEM_PROMPT_SCENARIO,
    userPrompt: `Generate a scenario in ${targetLang}.`,
  });
};

exports.generateFact = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const targetLang = getTargetLanguage(lang);
    if (isDev) {
      console.log(`[AI] Fact request started (provider=OpenRouter, lang=${lang}, model=${process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'})`);
    }
    const factData = await generateFactViaOpenRouterApi(targetLang);
    if (isDev) {
      console.log('[AI] Fact request succeeded (provider=OpenRouter)');
    }
    res.status(200).json(factData);
  } catch (error) {
    console.error('AI Fact OpenRouter Error:', error.message);
    if (isDev) {
      console.log('[AI] Fact fallback returned');
    }
    res.status(200).json({
      text: 'Cybersecurity is a shared responsibility. Always keep your software updated to protect against known vulnerabilities.',
      category: 'General',
      severity: 'medium',
      source: 'Sana Security Lab',
    });
  }
};

exports.generateScenario = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const targetLang = getTargetLanguage(lang);
    if (isDev) {
      console.log(`[AI] Scenario request started (provider=OpenRouter, lang=${lang}, model=${process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'})`);
    }
    const scenarioData = await generateScenarioViaOpenRouterApi(targetLang);
    // Add unique ID
    scenarioData.id = Date.now().toString();
    if (isDev) {
      console.log('[AI] Scenario request succeeded (provider=OpenRouter)');
    }
    res.status(200).json(scenarioData);
  } catch (error) {
    console.error('AI Scenario OpenRouter Error:', error.message);
    if (isDev) {
      console.log('[AI] Scenario fallback returned');
    }
    res.status(200).json(getFallbackScenario(req.query.lang || 'en'));
  }
};
