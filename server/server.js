const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables early from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Route imports
const factRoutes = require('./routes/factRoutes');
const quizRoutes = require('./routes/quizRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const articleRoutes = require('./routes/articleRoutes');
const historyRoutes = require('./routes/historyRoutes');


const app = express();
const PORT = process.env.PORT || 5001;
const clientBuildPath = path.resolve(__dirname, '../client/dist');
const clientIndexPath = path.join(clientBuildPath, 'index.html');
const clientBuildExists = fs.existsSync(clientIndexPath);

// --------------- Middleware ---------------

// CORS — allow client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sana API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/facts', factRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/history', historyRoutes);

if (clientBuildExists) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }

    return res.sendFile(clientIndexPath);
  });
}


// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// --------------- Server Start ---------------

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Auto-seed cyber facts if the collection is empty
    const CyberFact = require('./models/CyberFact');
    const factCount = await CyberFact.countDocuments();
    if (factCount === 0) {
      console.log('📦 No cyber facts found. Auto-seeding...');
      const { facts } = require('./data/seedFacts');
      await CyberFact.insertMany(facts);
      console.log(`✅ Auto-seeded ${facts.length} cyber facts`);
    }

    // Auto-seed articles if empty
    const Article = require('./models/Article');
    const articleCount = await Article.countDocuments();
    if (articleCount === 0) {
      console.log('📦 No articles found. Checking for admin to seed...');
      const User = require('./models/User');
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        const Scenario = require('./models/Scenario');
        const scenarios = await Scenario.find({ status: 'approved' });
        const initialArticles = [
          {
            title: 'Защита от фишинга: Полное руководство',
            description: 'Узнайте, как распознать поддельные письма и сайты.',
            content: '<h3>Что такое фишинг?</h3><p>Фишинг — это вид интернет-мошенничества...</p>',
            category: 'phishing',
            tag: 'Безопасность',
            icon: 'Shield',
            language: 'ru',
            author: admin._id,
            status: 'approved',
            points: ['Проверяйте URL сайта', 'Не доверяйте срочным запросам'],

            practiceScenario: scenarios.find(s => s.testType === 'phishing')?._id
          }
        ];
        await Article.insertMany(initialArticles);
        console.log(`✅ Auto-seeded ${initialArticles.length} articles`);
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Sana API Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔀 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    server.on('error', (listenError) => {
      if (listenError.code === 'EADDRINUSE') {
        console.error(
          `❌ Port ${PORT} is already in use. Another Sana server instance is likely running.`
        );
        console.error('🛑 Current process will exit gracefully to avoid nodemon crash loops.');
        process.exit(0);
      }

      console.error('❌ Server listen error:', listenError.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
