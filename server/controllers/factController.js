const CyberFact = require('../models/CyberFact');

const normalizeLang = (lang) => {
  const normalized = (lang || 'en').toString().toLowerCase();
  if (normalized.startsWith('ru')) return 'ru';
  if (normalized.startsWith('kz') || normalized.startsWith('kk')) return 'kz';
  return 'en';
};

const localizedRandomFacts = {
  ru: [
    {
      text: 'Двухфакторная аутентификация значительно снижает риск захвата аккаунта и блокирует большинство автоматических атак на вход.',
      category: 'identity-theft',
      severity: 'medium',
      source: 'Microsoft Security Research',
    },
    {
      text: 'Поддельные страницы входа часто используют почти одинаковые домены и интерфейсы, чтобы выманить логины и пароли у пользователей.',
      category: 'phishing',
      severity: 'high',
      source: 'CERT-KZ',
    },
    {
      text: 'Обновления приложений и системы закрывают уязвимости, которыми злоумышленники пользуются для заражения устройства.',
      category: 'malware',
      severity: 'medium',
      source: 'Sana Research',
    },
  ],
  kz: [
    {
      text: 'Екі факторлы аутентификация аккаунтты ұрлау қаупін айтарлықтай азайтып, автоматты шабуылдардың көбін бөгейді.',
      category: 'identity-theft',
      severity: 'medium',
      source: 'Microsoft Security Research',
    },
    {
      text: 'Жалған кіру беттері жиі ұқсас домендер мен интерфейстерді қолданып, логин мен құпиясөзді алдап алады.',
      category: 'phishing',
      severity: 'high',
      source: 'KZ-CERT',
    },
    {
      text: 'Жүйе мен қосымшаларды жаңарту құрылғыны жұқтыруға пайдаланылатын осалдықтарды жабады.',
      category: 'malware',
      severity: 'medium',
      source: 'Sana Research',
    },
  ],
};

const getLocalizedRandomFact = (lang) => {
  const normalizedLang = normalizeLang(lang);
  const facts = localizedRandomFacts[normalizedLang];
  if (!facts || !facts.length) return null;
  return facts[Math.floor(Math.random() * facts.length)];
};

/**
 * @desc    Get a random cyber fact
 * @route   GET /api/facts/random
 */
const getRandomFact = async (req, res, next) => {
  try {
    const lang = normalizeLang(req.query.lang);

    if (lang !== 'en') {
      const localizedFact = getLocalizedRandomFact(lang);
      if (localizedFact) {
        return res.status(200).json({
          success: true,
          data: localizedFact,
        });
      }
    }

    // Use MongoDB aggregation $sample for true random selection
    const facts = await CyberFact.aggregate([{ $sample: { size: 1 } }]);

    if (!facts.length) {
      return res.status(404).json({
        success: false,
        message: 'No cyber facts found. Please run the seed script.',
      });
    }

    res.status(200).json({
      success: true,
      data: facts[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all cyber facts (with optional category filter)
 * @route   GET /api/facts?category=fraud&page=1&limit=10
 */
const getAllFacts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [facts, total] = await Promise.all([
      CyberFact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CyberFact.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: facts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRandomFact, getAllFacts };
