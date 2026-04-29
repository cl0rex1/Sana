const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const CyberFact = require('../models/CyberFact');
const Scenario = require('../models/Scenario');
const Article = require('../models/Article');
const DailyStats = require('../models/DailyStats');
const TestHistory = require('../models/TestHistory');
const User = require('../models/User');
const ArticleHistory = require('../models/ArticleHistory');
const QuizResult = require('../models/QuizResult');
const { facts: baseFacts } = require('./seedFacts');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const shouldReset = process.argv.includes('--reset');

const extraFacts = [
  {
    text: 'Over 60% of mobile malware infections start with fake update prompts that redirect to cloned app stores.',
    category: 'malware',
    source: 'Mobile Security Lab',
    severity: 'high',
  },
  {
    text: 'Fraudsters increasingly use QR codes in posters and ads to redirect to phishing pages, bypassing URL suspicion.',
    category: 'phishing',
    source: 'Sana Research',
    severity: 'medium',
  },
  {
    text: 'Public Wi-Fi hotspots can be spoofed in minutes, allowing attackers to capture credentials and session cookies.',
    category: 'data-breach',
    source: 'CIS Threat Bulletin',
    severity: 'high',
  },
  {
    text: 'A reused password from a 2022 leak can still unlock accounts today if it was never rotated.',
    category: 'identity-theft',
    source: 'Credential Stuffing Report',
    severity: 'medium',
  },
  {
    text: 'SMS scam campaigns often spike around public holidays when banking activity increases.',
    category: 'fraud',
    source: 'National Bank of Kazakhstan',
    severity: 'medium',
  },
  {
    text: 'Social engineering succeeds more often when requests appear urgent or confidential.',
    category: 'fraud',
    source: 'Sana Research',
    severity: 'medium',
  },
  {
    text: 'Malicious browser extensions can silently read page content and capture form inputs.',
    category: 'malware',
    source: 'Browser Security Review',
    severity: 'high',
  },
  {
    text: 'Attackers target students with fake scholarship offers to harvest passports and ID scans.',
    category: 'identity-theft',
    source: 'Education Security Alert',
    severity: 'high',
  },
  {
    text: 'Deepfake video calls are increasingly used to convince victims to share one-time passwords.',
    category: 'fraud',
    source: 'AI Fraud Watch CIS 2026',
    severity: 'critical',
  },
  {
    text: 'The average phishing page is taken down within 9 hours, but victims are typically compromised in minutes.',
    category: 'phishing',
    source: 'Incident Response Metrics',
    severity: 'medium',
  },
];

const scenarioSeed = [
  {
    title: 'Срочное письмо от банка',
    description: 'Вы получаете письмо о блокировке карты и просьбе перейти по ссылке для подтверждения личности.',
    category: 'Phishing',
    testType: 'phishing',
    selectionType: 'single',
    language: 'ru',
    icon: '📧',
    choices: [
      { id: 'a', text: 'Открыть ссылку и подтвердить данные', isCorrect: false, feedback: 'Фишинговые письма часто маскируются под банк.' },
      { id: 'b', text: 'Позвонить в банк по номеру с официального сайта', isCorrect: true, feedback: 'Лучший способ подтвердить ситуацию.' },
      { id: 'c', text: 'Ответить на письмо и попросить разъяснений', isCorrect: false, feedback: 'Ответ может подтвердить активность вашего адреса.' },
    ],
  },
  {
    title: 'Подозрительный QR-код в кафе',
    description: 'В кафе вам предлагают отсканировать QR-код для оплаты, но он наклеен поверх оригинала.',
    category: 'Fraud',
    testType: 'standard',
    selectionType: 'single',
    language: 'ru',
    icon: '🧾',
    choices: [
      { id: 'a', text: 'Попросить другой способ оплаты', isCorrect: true, feedback: 'Так вы избегаете риска подмены.' },
      { id: 'b', text: 'Отсканировать код и ввести данные', isCorrect: false, feedback: 'Подмененные QR-коды ведут на фишинговые страницы.' },
      { id: 'c', text: 'Сфотографировать код на потом', isCorrect: false, feedback: 'Это не решает проблему риска.' },
    ],
  },
  {
    title: 'Unknown file in team chat',
    description: 'You receive a compressed file in a team chat with no message context.',
    category: 'Malware',
    testType: 'device',
    selectionType: 'single',
    language: 'en',
    icon: '📎',
    choices: [
      { id: 'a', text: 'Open it immediately to check content', isCorrect: false, feedback: 'Unknown archives are a common malware vector.' },
      { id: 'b', text: 'Verify with the sender first', isCorrect: true, feedback: 'Always confirm before opening.' },
      { id: 'c', text: 'Forward it to other teammates to ask', isCorrect: false, feedback: 'This spreads potential risk.' },
    ],
  },
  {
    title: 'Жалған конкурс в Instagram',
    description: 'Аккаунт знаменитости предлагает выигрыш и просит отправить номер карты для перевода приза.',
    category: 'Fraud',
    testType: 'social',
    selectionType: 'single',
    language: 'ru',
    icon: '🎁',
    choices: [
      { id: 'a', text: 'Отправить номер карты, чтобы получить приз', isCorrect: false, feedback: 'Призовые мошенничества часто требуют платежных данных.' },
      { id: 'b', text: 'Проверить официальные каналы и не делиться данными', isCorrect: true, feedback: 'Официальные конкурсы не требуют карту.' },
      { id: 'c', text: 'Перевести небольшую сумму для подтверждения', isCorrect: false, feedback: 'Это типичная схема развода.' },
    ],
  },
  {
    title: 'Қоғамдық Wi-Fi желісі',
    description: 'Сіз әуежайдағы тегін Wi-Fi-ға қосылып, банк қосымшасына кіргіңіз келеді.',
    category: 'Network',
    testType: 'device',
    selectionType: 'single',
    language: 'kz',
    icon: '📶',
    choices: [
      { id: 'a', text: 'VPN қосып, тек содан кейін кіру', isCorrect: true, feedback: 'VPN трафикті қорғайды.' },
      { id: 'b', text: 'Тікелей кіру, себебі бұл әуежай желісі', isCorrect: false, feedback: 'Жалған hotspot болуы мүмкін.' },
      { id: 'c', text: 'Wi-Fi өшіріп, бәрібір кіру', isCorrect: false, feedback: 'Wi-Fi өшірілгенде қосылу мүмкін емес.' },
    ],
  },
  {
    title: 'Colleague asks for urgent transfer',
    description: 'A colleague sends a message asking you to buy gift cards urgently for a client.',
    category: 'Social Engineering',
    testType: 'social',
    selectionType: 'single',
    language: 'en',
    icon: '💳',
    choices: [
      { id: 'a', text: 'Purchase the cards right away', isCorrect: false, feedback: 'This is a common scam pattern.' },
      { id: 'b', text: 'Call the colleague using a known number', isCorrect: true, feedback: 'Verify via a trusted channel.' },
      { id: 'c', text: 'Send your own bank details to confirm', isCorrect: false, feedback: 'Never share financial details.' },
    ],
  },
  {
    title: 'SMS с посылкой',
    description: 'Приходит SMS о доставке с короткой ссылкой на оплату пошлины.',
    category: 'Phishing',
    testType: 'phishing',
    selectionType: 'single',
    language: 'ru',
    icon: '📦',
    choices: [
      { id: 'a', text: 'Перейти по ссылке и оплатить', isCorrect: false, feedback: 'Короткие ссылки часто ведут на фишинг.' },
      { id: 'b', text: 'Проверить трек-номер на официальном сайте', isCorrect: true, feedback: 'Используйте официальный сайт перевозчика.' },
      { id: 'c', text: 'Ответить на SMS', isCorrect: false, feedback: 'Это подтверждает активный номер.' },
    ],
  },
  {
    title: 'Device update popup',
    description: 'A pop-up says your device is infected and needs an urgent update.',
    category: 'Malware',
    testType: 'device',
    selectionType: 'single',
    language: 'en',
    icon: '🛡️',
    choices: [
      { id: 'a', text: 'Close the pop-up and update via official settings', isCorrect: true, feedback: 'Use trusted update channels.' },
      { id: 'b', text: 'Click the pop-up to install', isCorrect: false, feedback: 'This is often a scareware tactic.' },
      { id: 'c', text: 'Share the pop-up link with friends', isCorrect: false, feedback: 'Sharing increases the risk.' },
    ],
  },
  {
    title: 'Жұмыс сұхбаты үшін құжаттар',
    description: 'Сізден жұмыс ұсынысы үшін паспорттың сканын жіберуді сұрайды, бірақ компания белгісіз.',
    category: 'Identity Theft',
    testType: 'standard',
    selectionType: 'single',
    language: 'kz',
    icon: '🧑‍💼',
    choices: [
      { id: 'a', text: 'Компанияны тексеріп, ресми сайтты сұрау', isCorrect: true, feedback: 'Алдымен компанияны растаңыз.' },
      { id: 'b', text: 'Құжаттарды бірден жіберу', isCorrect: false, feedback: 'Бұл деректер ұрлануы мүмкін.' },
      { id: 'c', text: 'Әлеуметтік желіден сұрау', isCorrect: false, feedback: 'Бұл сенімді тексеру емес.' },
    ],
  },
  {
    title: 'Learning: safe password',
    description: 'You want to create a strong password for a new account.',
    category: 'Learning',
    testType: 'learning',
    selectionType: 'single',
    language: 'en',
    icon: '🔐',
    choices: [
      { id: 'a', text: 'Use a long passphrase with symbols', isCorrect: true, feedback: 'Long passphrases are safer.' },
      { id: 'b', text: 'Reuse an old password', isCorrect: false, feedback: 'Reusing increases risk.' },
      { id: 'c', text: 'Use your birthdate', isCorrect: false, feedback: 'Birthdates are easy to guess.' },
    ],
  },
  {
    title: 'Сообщение в мессенджере от начальника',
    description: 'Начальник пишет с нового номера и просит срочно перевести деньги.',
    category: 'Social Engineering',
    testType: 'social',
    selectionType: 'single',
    language: 'ru',
    icon: '📲',
    choices: [
      { id: 'a', text: 'Сразу перевести, чтобы помочь', isCorrect: false, feedback: 'Нужно подтверждение по другому каналу.' },
      { id: 'b', text: 'Перезвонить начальнику на известный номер', isCorrect: true, feedback: 'Так вы избегаете подмены.' },
      { id: 'c', text: 'Запросить номер карты', isCorrect: false, feedback: 'Это может быть мошенник.' },
    ],
  },
  {
    title: 'Suspicious browser extension',
    description: 'A new extension requests access to all websites you visit.',
    category: 'Malware',
    testType: 'device',
    selectionType: 'single',
    language: 'en',
    icon: '🧩',
    choices: [
      { id: 'a', text: 'Deny and install only trusted extensions', isCorrect: true, feedback: 'Limit permissions to reduce risk.' },
      { id: 'b', text: 'Allow it for convenience', isCorrect: false, feedback: 'Full access is risky.' },
      { id: 'c', text: 'Ignore the warning', isCorrect: false, feedback: 'Warnings should not be ignored.' },
    ],
  },
];

const articleSeed = [
  {
    title: 'Как распознать инвестиционный скам',
    description: 'Ключевые признаки фейковых инвестиционных предложений и как защитить себя.',
    content: '<h3>Красные флаги</h3><ul><li>Гарантия высокой доходности</li><li>Срочные сроки</li><li>Запрос предоплаты</li></ul>',
    category: 'social',
    tag: 'Финансы',
    icon: 'TrendingUp',
    language: 'ru',
    points: ['Проверяйте лицензии', 'Не переводите деньги незнакомым', 'Ищите отзывы'],
  },
  {
    title: 'Protecting your accounts in 2026',
    description: 'Simple steps to reduce account takeover risk today.',
    content: '<h3>Core steps</h3><p>Enable MFA, use a password manager, and review device access monthly.</p>',
    category: 'standard',
    tag: 'Accounts',
    icon: 'Shield',
    language: 'en',
    points: ['Use MFA', 'Rotate passwords after leaks', 'Review login history'],
  },
  {
    title: 'Қауіпсіз чат мәдениеті',
    description: 'Онлайн әңгімеде жеке деректерді қорғау бойынша кеңестер.',
    content: '<h3>Негізгі қағидалар</h3><p>Жеке деректерді чатта жарияламаңыз, таныс емес файлдарды ашпаңыз.</p>',
    category: 'social',
    tag: 'Қауіпсіздік',
    icon: 'MessageSquare',
    language: 'kz',
    points: ['Файлдарды тексеру', 'Құпиясөзді жібермеу', 'Сілтемелерді тексеру'],
  },
  {
    title: 'Wi-Fi қауіпсіздігі бойынша чек-лист',
    description: 'Қоғамдық желілерді қауіпсіз пайдалану туралы қысқа нұсқаулық.',
    content: '<h3>Чек-лист</h3><ul><li>VPN қолдану</li><li>Банк қосымшаларын ашпау</li><li>Құрылғы жаңартуларын қосу</li></ul>',
    category: 'network',
    tag: 'Wi-Fi',
    icon: 'Wifi',
    language: 'kz',
    points: ['VPN қосу', 'HTTPS тексеру', 'Автоқосылуды өшіру'],
  },
  {
    title: 'Кибербуллинг: как действовать',
    description: 'Пошаговый план, если вы столкнулись с травлей в сети.',
    content: '<h3>Что делать</h3><ol><li>Сохраните доказательства</li><li>Заблокируйте нарушителя</li><li>Сообщите взрослым</li></ol>',
    category: 'social',
    tag: 'Безопасность',
    icon: 'ShieldAlert',
    language: 'ru',
    points: ['Фиксируйте скриншоты', 'Не вступайте в спор', 'Сообщайте модераторам'],
  },
  {
    title: 'Email safety checklist',
    description: 'Quick checks before opening links or attachments.',
    content: '<h3>Checklist</h3><ul><li>Verify sender domain</li><li>Hover links before clicking</li><li>Report suspicious messages</li></ul>',
    category: 'phishing',
    tag: 'Email',
    icon: 'Mail',
    language: 'en',
    points: ['Check sender address', 'Avoid urgent requests', 'Use MFA'],
  },
];

const generateStats = () => {
  const mockData = [];
  const startYear = 2024;
  const endYear = 2026;

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const baseMultiplier = 1 + (year - startYear) * 0.3;
      const seasonalFactor = 1 + Math.sin((month / 12) * Math.PI * 2) * 0.2;

      const fraud = Math.round((150 + Math.random() * 100) * baseMultiplier * seasonalFactor);
      const bullying = Math.round((80 + Math.random() * 60) * baseMultiplier * seasonalFactor);
      const phishing = Math.round((200 + Math.random() * 150) * baseMultiplier * seasonalFactor);
      const malware = Math.round((50 + Math.random() * 40) * baseMultiplier * seasonalFactor);
      const breaches = Math.round((10 + Math.random() * 15) * baseMultiplier * seasonalFactor);

      mockData.push({
        date: new Date(year, month, 1),
        totalIncidents: fraud + bullying + phishing + malware + breaches,
        fraudCases: fraud,
        bullyingCases: bullying,
        phishingAttempts: phishing,
        malwareDetected: malware,
        dataBreaches: breaches,
        region: 'Kazakhstan',
      });
    }
  }

  return mockData;
};

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const seedDemo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sana';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for demo seed');

    if (shouldReset) {
      await Promise.all([
        CyberFact.deleteMany({}),
        Scenario.deleteMany({}),
        Article.deleteMany({}),
        DailyStats.deleteMany({}),
        TestHistory.deleteMany({}),
        ArticleHistory.deleteMany({}),
        QuizResult.deleteMany({}),
      ]);
      console.log('🗑️  Cleared existing demo collections');
    }

    const usersData = [
      { username: 'admin', email: 'admin@sana.kz', password: 'Admin123!', role: 'admin' },
      { username: 'demo_user', email: 'demo@sana.kz', password: 'User123!', role: 'user' },
      { username: 'teacher', email: 'teacher@sana.kz', password: 'User123!', role: 'user' },
    ];

    const users = [];
    for (const userData of usersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }
      users.push(user);
    }

    const adminUser = users.find((u) => u.role === 'admin') || users[0];

    const factCount = await CyberFact.countDocuments();
    if (factCount < 25 || shouldReset) {
      const combinedFacts = [...baseFacts, ...extraFacts];
      if (shouldReset) {
        await CyberFact.insertMany(combinedFacts);
      } else {
        await CyberFact.insertMany(extraFacts);
      }
      console.log(`✅ Seeded cyber facts: ${combinedFacts.length}`);
    }

    const scenarioCount = await Scenario.countDocuments();
    if (scenarioCount < 12 || shouldReset) {
      const scenarioDocs = scenarioSeed.map((scenario) => ({
        ...scenario,
        creator: adminUser._id,
        status: 'approved',
        moderatedBy: 'human',
        aiFeedback: 'Seeded demo scenario.',
      }));

      await Scenario.insertMany(scenarioDocs);
      console.log(`✅ Seeded scenarios: ${scenarioDocs.length}`);
    }

    const approvedScenarios = await Scenario.find({ status: 'approved' });
    const scenarioByType = approvedScenarios.reduce((acc, scenario) => {
      if (!acc[scenario.testType]) {
        acc[scenario.testType] = scenario;
      }
      return acc;
    }, {});

    const articleCategoryToTestType = {
      phishing: 'phishing',
      standard: 'standard',
      device: 'device',
      social: 'social',
      network: 'device',
      general: 'mixed',
    };

    const articleCount = await Article.countDocuments();
    if (articleCount < 6 || shouldReset) {
      const articles = articleSeed.map((article) => {
        const mappedType = articleCategoryToTestType[article.category] || 'mixed';
        return {
          ...article,
          author: adminUser._id,
          status: 'approved',
          moderatedBy: 'human',
          practiceScenario: scenarioByType[mappedType]?._id || null,
        };
      });

      await Article.insertMany(articles);
      console.log(`✅ Seeded articles: ${articles.length}`);
    }

    const statsCount = await DailyStats.countDocuments();
    if (statsCount < 36 || shouldReset) {
      const stats = generateStats();
      await DailyStats.insertMany(stats);
      console.log(`✅ Seeded stats records: ${stats.length}`);
    }

    const nonAdminUsers = users.filter((u) => u.role !== 'admin');
    const scenarios = await Scenario.find({ status: 'approved' });
    if (scenarios.length && nonAdminUsers.length) {
      for (const user of nonAdminUsers) {
        const historyCount = await TestHistory.countDocuments({ user: user._id });
        if (historyCount > 0 && !shouldReset) {
          continue;
        }

        const historyDocs = Array.from({ length: 5 }).map(() => {
          const selected = Array.from({ length: 3 }).map(() => pickRandom(scenarios));
          const selectedChoices = selected.map((scenario) => pickRandom(scenario.choices || []));
          const correctAnswers = selectedChoices.filter((choice) => choice?.isCorrect).length;
          const score = Math.round((correctAnswers / selected.length) * 100);

          return {
            user: user._id,
            testType: pickRandom(['phishing', 'standard', 'social', 'device', 'mixed']),
            score,
            totalQuestions: selected.length,
            correctAnswers,
            timeSpent: 45 + Math.floor(Math.random() * 90),
            details: selected.map((scenario, index) => ({
              scenarioId: scenario._id.toString(),
              scenarioTitle: scenario.title,
              choiceText: selectedChoices[index]?.text || '',
              isCorrect: selectedChoices[index]?.isCorrect ? 1 : 0,
              selectionType: scenario.selectionType,
            })),
          };
        });

        await TestHistory.insertMany(historyDocs);
      }
      console.log('✅ Seeded test history');
    }

    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Demo seeding failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDemo();
}

module.exports = { seedDemo };
