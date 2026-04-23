const Scenario = require('../models/Scenario');

const SYSTEM_PROMPT_FACT = `You are a cybersecurity expert. Provide exactly ONE short, engaging, and highly informative fact about cybersecurity, digital hygiene, or internet threats.
IMPORTANT RULES:
- The fact MUST be strictly in the requested language.
- Do NOT start the fact with phrases like "According to report", "According to reports", "Согласно отчету", "Согласно отчёту", "Есепке сәйкес".
- Do NOT include any year or date numbers in the fact text (no 2024/2025/etc.).
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
- Create 3 choices.
- selectionType: "single" or "multiple". If "multiple", there can be 2 correct answers.
- Output ONLY valid JSON, exactly matching this schema:
{
  "title": "Short catchy title",
  "description": "2-3 sentences describing the scenario",
  "category": "One of: Phishing, Passwords, Network, Social Engineering, Device Security",
  "icon": "A single emoji representing the scenario",
  "selectionType": "single" or "multiple",
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

const SYSTEM_PROMPT_SCENARIO_BATCH = `You are a cybersecurity training system. Generate a FULL TEST consisting of multiple realistic, engaging, and challenging daily-life scenarios where a user must make security-related choices.
IMPORTANT RULES:
- Include "trick questions": some scenarios should seem completely harmless, but have subtle red flags, or seem dangerous but are actually completely safe.
- Create ambiguous situations where social engineering, urgency, or authority figures pressure the user.
- The content MUST be strictly in the requested language.
- Return ONLY a valid JSON array, no markdown, no extra text.
- Each scenario in the array must be different in setting, threat type, title, and choice wording.
- Avoid repeating the same pattern more than once across the whole array.
- Every scenario must contain exactly 3 choices.
- selectionType: "single" or "multiple".
- If "single", exactly 1 correct choice. If "multiple", 2 correct choices.
- Keep the correct choices varied.
- Output ONLY an array matching this shape:
[
  {
    "title": "Short catchy title",
    "description": "2-3 sentences describing the scenario",
    "category": "One of: Phishing, Passwords, Network, Social Engineering, Device Security",
    "icon": "A single emoji representing the scenario",
    "selectionType": "single" or "multiple",
    "choices": [
      {
        "id": "A",
        "text": "Choice text",
        "isCorrect": true/false,
        "feedback": "Why this was the right or wrong choice (1 sentence)"
      }
    ]
  }
]`;

const sanitizeJsonText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText.replace(/^```json\s*|\s*```$/g, '').trim();
};

const extractJsonCandidate = (text) => {
  if (!text) return '';

  const objectStart = text.indexOf('{');
  const arrayStart = text.indexOf('[');
  const starts = [objectStart, arrayStart].filter((index) => index !== -1);
  if (starts.length === 0) return '';

  const start = Math.min(...starts);
  const openChar = text[start];
  const closeChar = openChar === '[' ? ']' : '}';

  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (character === openChar) depth += 1;
    if (character === closeChar) depth -= 1;

    if (depth === 0) {
      return text.slice(start, index + 1);
    }
  }

  return '';
};

const parseModelJson = (rawText) => {
  const text = sanitizeJsonText(rawText);
  const candidate = extractJsonCandidate(text) || text;
  return JSON.parse(candidate);
};

const normalizeLang = (lang) => {
  const normalized = (lang || 'en').toString().toLowerCase();
  if (normalized.startsWith('ru')) return 'ru';
  if (normalized.startsWith('kz') || normalized.startsWith('kk')) return 'kz';
  return 'en';
};

const getTargetLanguage = (lang) => {
  const normalizedLang = normalizeLang(lang);
  const langNames = {
    ru: 'Russian',
    en: 'English',
    kz: 'Kazakh',
  };
  return langNames[normalizedLang] || 'English';
};

const normalizeAiTestType = (value) => {
  const normalized = (value || 'mixed').toString().toLowerCase();
  if (['standard', 'phishing', 'social', 'device', 'mixed', 'learning'].includes(normalized)) {
    return normalized;
  }
  return 'mixed';
};

const getTypeInstruction = (type) => {
  switch (type) {
    case 'phishing':
      return 'Focus mainly on phishing via email, SMS, QR codes, fake support chats, and fake login pages.';
    case 'social':
      return 'Focus mainly on social engineering, urgency pressure, authority impersonation, and manipulation tactics.';
    case 'device':
      return 'Focus mainly on device security, app permissions, update safety, public Wi-Fi, and endpoint hygiene.';
    case 'learning':
      return 'Create educational progression: include one easy, one medium, and one tricky scenario with clear teachable moments.';
    case 'standard':
      return 'Create practical day-to-day cybersecurity scenarios suitable for a broad audience.';
    case 'mixed':
    default:
      return 'Mix multiple cybersecurity themes and vary threat patterns broadly.';
  }
};

const isDev = process.env.NODE_ENV !== 'production';
const RECENT_SCENARIO_LIMIT = 20;
const recentScenarioFingerprints = [];

const normalizeScenarioText = (text) =>
  (text || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .trim();

const buildScenarioFingerprint = (scenario) => {
  if (!scenario) return '';

  const choiceTexts = Array.isArray(scenario.choices)
    ? scenario.choices.map((choice) => normalizeScenarioText(choice?.text)).filter(Boolean).sort()
    : [];

  return [
    normalizeScenarioText(scenario.title),
    normalizeScenarioText(scenario.description),
    ...choiceTexts,
  ]
    .filter(Boolean)
    .join(' | ');
};

const shuffleScenarioChoices = (scenario) => {
  if (!scenario?.choices || !Array.isArray(scenario.choices)) {
    return scenario;
  }

  const shuffledChoices = [...scenario.choices].sort(() => Math.random() - 0.5);

  return {
    ...scenario,
    choices: shuffledChoices.map((choice, index) => ({
      ...choice,
      id: String.fromCharCode(65 + index),
    })),
  };
};

const normalizeScenarioBatch = (scenarios, knownFingerprints, expectedCount) => {
  if (!Array.isArray(scenarios)) return [];

  const uniqueScenarios = [];
  const batchFingerprints = new Set();

  for (const scenario of scenarios) {
    if (!scenario || !scenario.title || !scenario.description || !Array.isArray(scenario.choices)) {
      continue;
    }

    const normalizedScenario = shuffleScenarioChoices(scenario);
    const fingerprint = buildScenarioFingerprint(normalizedScenario);
    if (!fingerprint || batchFingerprints.has(fingerprint) || knownFingerprints.has(fingerprint)) {
      continue;
    }

    batchFingerprints.add(fingerprint);
    uniqueScenarios.push({
      ...normalizedScenario,
      id: `${Date.now()}-${uniqueScenarios.length}`,
    });

    if (uniqueScenarios.length >= expectedCount) {
      break;
    }
  }

  return uniqueScenarios;
};

const rememberScenarioFingerprint = (fingerprint) => {
  if (!fingerprint) return;
  recentScenarioFingerprints.unshift(fingerprint);
  if (recentScenarioFingerprints.length > RECENT_SCENARIO_LIMIT) {
    recentScenarioFingerprints.length = RECENT_SCENARIO_LIMIT;
  }
};

const isRepeatedScenario = (scenario, knownFingerprints) => {
  const fingerprint = buildScenarioFingerprint(scenario);
  if (!fingerprint) return true;

  return recentScenarioFingerprints.includes(fingerprint) || knownFingerprints.has(fingerprint);
};

const getFallbackScenario = (lang) => {
  const normalizedLang = normalizeLang(lang);
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
    ...scenarios[normalizedLang] || scenarios.en,
    id: Date.now().toString(),
  };
};

const getFallbackFact = (lang) => {
  const normalizedLang = normalizeLang(lang);
  const facts = {
    ru: {
      text: 'Двухфакторная аутентификация блокирует большую часть автоматических захватов аккаунтов и заметно снижает риск взлома.',
      category: 'General',
      severity: 'medium',
      source: 'Microsoft Security Research',
    },
    kz: {
      text: 'Екі факторлы аутентификация автоматты аккаунт ұрлау шабуылдарының басым бөлігін тоқтатып, бұзылу қаупін азайтады.',
      category: 'General',
      severity: 'medium',
      source: 'Microsoft Security Research',
    },
    en: {
      text: 'Two-factor authentication blocks most automated account takeover attempts and significantly reduces the risk of compromise.',
      category: 'General',
      severity: 'medium',
      source: 'Microsoft Security Research',
    },
  };

  return facts[normalizedLang] || facts.en;
};

const stripFactLeadIn = (text) => {
  if (!text) return '';
  return text
    .replace(/^\s*(according to (the )?reports?|according to report)\s*[:,\-]?\s*/i, '')
    .replace(/^\s*согласно\s+отч[её]ту\s*[:,\-]?\s*/i, '')
    .replace(/^\s*есепке\s+сәйкес\s*[:,\-]?\s*/i, '')
    .trim();
};

const stripYears = (text) => {
  if (!text) return '';
  return text
    .replace(/\b(?:19|20)\d{2}\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
};

const getLatinRatio = (text) => {
  const letters = (text.match(/\p{L}/gu) || []).length;
  if (!letters) return 0;
  const latinLetters = (text.match(/[A-Za-z]/g) || []).length;
  return latinLetters / letters;
};

const sanitizeFactByLanguageRules = (factData, lang) => {
  const normalizedLang = normalizeLang(lang);
  const fallback = getFallbackFact(normalizedLang);

  const originalText = (factData?.text || '').toString();
  const cleanedText = stripYears(stripFactLeadIn(originalText));

  if (!cleanedText) {
    return fallback;
  }

  if (normalizedLang !== 'en' && getLatinRatio(cleanedText) > 0.6) {
    return fallback;
  }

  return {
    text: cleanedText,
    category: factData?.category || fallback.category,
    severity: factData?.severity || fallback.severity,
    source: factData?.source || fallback.source,
  };
};

const callAiApi = async ({
  systemPrompt,
  userPrompt,
  model,
  temperature = 0.7,
  maxTokens = 500,
  requestTimeoutMs = 30000,
}) => {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
  const baseUrl = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'Sana Cybersecurity Platform',
      },
      body: JSON.stringify({
        model: model || process.env.OPENROUTER_MODEL || 'inclusionai/ling-2.6-1t:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API request failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    const rawContent = payload?.choices?.[0]?.message?.content || '';
    return parseModelJson(rawContent);
  } finally {
    clearTimeout(timeoutId);
  }
};

const generateFactViaOpenRouterApi = async (targetLang) => {
  return callAiApi({
    systemPrompt: SYSTEM_PROMPT_FACT,
    userPrompt: `Generate a cybersecurity fact in ${targetLang}. Focus on real-world data.`,
  });
};

const generateScenarioViaOpenRouterApi = async (targetLang, extraInstructions = '') => {
  return callAiApi({
    systemPrompt: SYSTEM_PROMPT_SCENARIO,
    userPrompt: `Generate a scenario in ${targetLang}. ${extraInstructions}`.trim(),
    model: process.env.OPENROUTER_SCENARIO_MODEL || 'inclusionai/ling-2.6-1t:free',
    temperature: 0.2,
    maxTokens: 800,
    requestTimeoutMs: 45000,
  });
};

const generateScenarioBatchViaOpenRouterApi = async (targetLang, count, extraInstructions = '') => {
  return callAiApi({
    systemPrompt: SYSTEM_PROMPT_SCENARIO_BATCH,
    userPrompt: `Generate ${count} scenarios in ${targetLang}. ${extraInstructions}`.trim(),
    model: process.env.OPENROUTER_SCENARIO_MODEL || 'inclusionai/ling-2.6-1t:free',
    temperature: 0.35,
    maxTokens: 2600,
    requestTimeoutMs: 60000,
  });
};

exports.generateFact = async (req, res) => {
  try {
    const lang = normalizeLang(req.query.lang);
    const targetLang = getTargetLanguage(lang);
    if (isDev) {
      console.log(`[AI] Fact request started (provider=OpenRouter, lang=${lang}, model=${process.env.OPENROUTER_MODEL || 'inclusionai/ling-2.6-1t:free'})`);
    }
    const factData = await generateFactViaOpenRouterApi(targetLang);
    const localizedFact = sanitizeFactByLanguageRules(factData, lang);
    if (isDev) {
      console.log('[AI] Fact request succeeded (provider=OpenRouter)');
    }
    res.status(200).json(localizedFact);
  } catch (error) {
    console.error('AI Fact OpenRouter Error:', error.message);
    if (isDev) {
      console.log('[AI] Fact fallback returned');
    }
    res.status(200).json(getFallbackFact(req.query.lang || 'en'));
  }
};

exports.generateScenario = async (req, res) => {
  try {
    const lang = normalizeLang(req.query.lang);
    const testType = normalizeAiTestType(req.query.type);
    const targetLang = getTargetLanguage(lang);
    const primaryScenarioModel = process.env.OPENROUTER_SCENARIO_MODEL || 'inclusionai/ling-2.6-1t:free';
    const backupScenarioModel = process.env.OPENROUTER_SCENARIO_BACKUP_MODEL || 'inclusionai/ling-2.6-1t:free';
    const scenarioModels = [...new Set([primaryScenarioModel, backupScenarioModel].filter(Boolean))];

    if (isDev) {
      console.log(`[AI] Scenario request started (provider=OpenRouter, lang=${lang}, model=${primaryScenarioModel}, timeout=45000ms)`);
    }
    const existingScenarios = await Scenario.find({}, 'title description choices').limit(100);
    const knownFingerprints = new Set(existingScenarios.map(buildScenarioFingerprint).filter(Boolean));

    const retryThemes = [];
    let scenarioData = null;

    for (const model of scenarioModels) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const extraInstructions = retryThemes.length
          ? `Do not repeat these recent themes or structures: ${retryThemes.join('; ')}. Create a different everyday situation, different title, and different choice wording. ${getTypeInstruction(testType)}`
          : `Avoid the most common phishing, password reset, or fake delivery examples. Use a fresh everyday situation and distinct answer choices. ${getTypeInstruction(testType)}`;

        try {
          scenarioData = await callAiApi({
            systemPrompt: SYSTEM_PROMPT_SCENARIO,
            userPrompt: `Generate a scenario in ${targetLang}. ${extraInstructions}`.trim(),
            model,
            temperature: 0.2,
            maxTokens: 800,
          });

          if (scenarioData?.choices && !isRepeatedScenario(scenarioData, knownFingerprints)) {
            scenarioData = shuffleScenarioChoices(scenarioData);
            break;
          }

          if (scenarioData?.title) {
            retryThemes.push(normalizeScenarioText(scenarioData.title));
          }

          scenarioData = null;
        } catch (attemptError) {
          if (isDev) {
            console.warn(`[AI] Scenario parse failed for model ${model}:`, attemptError.message);
          }
          scenarioData = null;
        }
      }

      if (scenarioData) {
        break;
      }
    }

    if (!scenarioData) {
      throw new Error('AI scenario generation failed');
    }

    // Add unique ID and remember the generated fingerprint to reduce repeats in this process.
    scenarioData.id = Date.now().toString();
    rememberScenarioFingerprint(buildScenarioFingerprint(scenarioData));

    if (isDev) {
      console.log('[AI] Scenario request succeeded (provider=OpenRouter)');
    }
    res.status(200).json(scenarioData);
  } catch (error) {
    console.error('AI Scenario OpenRouter Error:', error.message);
    if (isDev) {
      console.log('[AI] Scenario request failed with no fallback');
    }
    res.status(500).json({
      success: false,
      message: 'AI scenario generation is unavailable right now. Please try again later.',
    });
  }
};

exports.generateScenarioBatch = async (req, res) => {
  try {
    const lang = normalizeLang(req.query.lang);
    const testType = normalizeAiTestType(req.query.type);
    const targetLang = getTargetLanguage(lang);
    const requestedCount = Number.parseInt(req.query.count, 10);
    const count = Number.isFinite(requestedCount) ? Math.min(Math.max(requestedCount, 1), 8) : 5;
    const model = process.env.OPENROUTER_SCENARIO_MODEL || 'inclusionai/ling-2.6-1t:free';

    if (isDev) {
      console.log(`[AI] Scenario batch request started (provider=OpenRouter, lang=${lang}, count=${count}, model=${model}, timeout=60000ms)`);
    }

    const existingScenarios = await Scenario.find({}, 'title description choices').limit(150);
    const knownFingerprints = new Set(existingScenarios.map(buildScenarioFingerprint).filter(Boolean));
    const knownTitles = existingScenarios
      .map((scenario) => normalizeScenarioText(scenario.title))
      .filter(Boolean)
      .slice(0, 24)
      .join('; ');

    let scenarios = [];

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const extraInstructions = attempt === 0
        ? `Avoid these existing scenario titles and patterns: ${knownTitles || 'none'}. Make the scenarios feel different from one another. ${getTypeInstruction(testType)}`
        : `The previous answer had duplicates or missing items. Return exactly ${count} unique scenarios only. Each scenario must be distinct from the others and from the existing titles. ${getTypeInstruction(testType)}`;

      try {
        const batch = await generateScenarioBatchViaOpenRouterApi(targetLang, count, extraInstructions);
        scenarios = normalizeScenarioBatch(batch, knownFingerprints, count);

        if (scenarios.length === count) {
          break;
        }
      } catch (attemptError) {
        if (isDev) {
          console.warn(`[AI] Scenario batch attempt failed: ${attemptError.message}`);
        }
        scenarios = [];
      }
    }

    if (scenarios.length !== count) {
      throw new Error('AI scenario batch generation failed');
    }

    scenarios.forEach((scenario) => {
      rememberScenarioFingerprint(buildScenarioFingerprint(scenario));
    });

    if (isDev) {
      console.log('[AI] Scenario batch request succeeded (provider=OpenRouter)');
    }

    res.status(200).json(scenarios);
  } catch (error) {
    console.error('AI Scenario Batch OpenRouter Error:', error.message);
    if (isDev) {
      console.log('[AI] Scenario batch request failed with no fallback');
    }
    res.status(500).json({
      success: false,
      message: 'AI test generation is unavailable right now. Please try again later.',
    });
  }
};
