const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables early
dotenv.config();

// Route imports
const factRoutes = require('./routes/factRoutes');
const quizRoutes = require('./routes/quizRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

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

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Sana API Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔀 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
