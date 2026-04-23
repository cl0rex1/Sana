const mongoose = require('mongoose');
const Article = require('../models/Article');
const Scenario = require('../models/Scenario');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedArticles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please create an admin first.');
      process.exit(1);
    }

    const scenarios = await Scenario.find({ status: 'approved' });
    
    const articles = [
      {
        title: 'Защита от фишинга: Полное руководство',
        description: 'Узнайте, как распознать поддельные письма и сайты, чтобы не стать жертвой мошенников.',
        content: `
          <h3>Что такое фишинг?</h3>
          <p>Фишинг — это вид интернет-мошенничества, целью которого является получение доступа к конфиденциальным данным пользователей — логинам и паролям. Это достигается путём проведения массовых рассылок электронных писем от имени популярных брендов, а также личных сообщений внутри популярных сервисов.</p>
          
          <h3>Как это работает?</h3>
          <p>Обычно мошенники создают точную копию известного сайта (банка, социальной сети или интернет-магазина) и побуждают пользователя ввести там свои данные.</p>
          
          <ul>
            <li>Проверяйте адресную строку браузера.</li>
            <li>Не переходите по подозрительным ссылкам из писем.</li>
            <li>Используйте двухфакторную аутентификацию.</li>
          </ul>
          
          <p>Будьте осторожны и всегда проверяйте отправителя письма!</p>
        `,
        category: 'phishing',
        tag: 'Безопасность',
        icon: 'Shield',
        language: 'ru',
        author: admin._id,
        points: [
          'Проверяйте URL сайта перед вводом данных',
          'Не доверяйте срочным запросам "обновить пароль"',
          'Используйте менеджеры паролей'
        ],
        practiceScenario: scenarios.find(s => s.testType === 'phishing')?._id
      },
      {
        title: 'Сильные пароли и их хранение',
        description: 'Почему 123456 — плохой выбор, и как менеджеры паролей спасают вашу цифровую жизнь.',
        content: `
          <h3>Основы безопасности паролей</h3>
          <p>Пароль — это ваш главный ключ к цифровому миру. Если он слабый, взломщик подберет его за секунды с помощью метода "брутфорс".</p>
          
          <h3>Признаки сильного пароля:</h3>
          <p>Хороший пароль должен содержать минимум 12 символов, включая заглавные буквы, цифры и спецсимволы.</p>
          
          <p>Мы рекомендуем использовать менеджеры паролей, такие как Bitwarden или 1Password, чтобы не запоминать сотни сложных комбинаций.</p>
        `,
        category: 'standard',
        tag: 'Пароли',
        icon: 'Lock',
        language: 'ru',
        author: admin._id,
        points: [
          'Пароль должен быть уникальным для каждого сервиса',
          'Используйте фразы вместо простых слов',
          'Меняйте пароли после утечек данных'
        ],
        practiceScenario: scenarios.find(s => s.testType === 'standard')?._id
      }
    ];

    await Article.deleteMany({ author: admin._id }); // Clear existing from this author
    await Article.insertMany(articles);
    console.log('Successfully seeded articles!');
    process.exit();
  } catch (err) {
    console.error('Error seeding articles:', err);
    process.exit(1);
  }
};

seedArticles();
