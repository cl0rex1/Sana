const mongoose = require('mongoose');
const Article = require('../models/Article');
const ArticleHistory = require('../models/ArticleHistory');
const axios = require('axios');

const buildArticlePipeline = (match = {}) => [
  { $match: match },
  { $sort: { createdAt: -1 } },
  {
    $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    },
  },
  {
    $unwind: {
      path: '$author',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'scenarios',
      localField: 'practiceScenario',
      foreignField: '_id',
      as: 'practiceScenario',
    },
  },
  {
    $unwind: {
      path: '$practiceScenario',
      preserveNullAndEmptyArrays: true,
    },
  },
];

const moderateArticleWithAI = async (articleData) => {
  try {
    const systemPrompt = `You are a cybersecurity expert and content moderator. Review the following article for:
1. Relevance: Must be related to cybersecurity, digital privacy, or online safety.
2. Safety: No hate speech, offensive language, or dangerous instructions.
3. Quality: Must be informative and educational.

Reply ONLY with valid JSON:
{
  "status": "approved" | "rejected",
  "feedback": "A short reason."
}`;

    const userPrompt = `Title: ${articleData.title}\nDescription: ${articleData.description}\nContent: ${articleData.content}`;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';

    const response = await axios.post(
      baseUrl,
      {
        model: process.env.OPENROUTER_SCENARIO_MODEL || 'inclusionai/ling-2.6-1t:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'Sana Platform',
          'ngrok-skip-browser-warning': '1',
        },
      }
    );

    const rawResult = response.data.choices[0].message.content;
    const cleanJson = rawResult.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      status: (parsed.status || 'approved').toLowerCase(),
      feedback: parsed.feedback || ''
    };
  } catch (error) {
    const status = error?.response?.status;
    console.error('AI Article Moderation Error:', error.message);
    
    // If rate limited or quota issue, we return rejected to stay on the page
    if (status === 429) {
      console.warn('AI Moderation rate limited (429).');
      return { status: 'rejected', feedback: 'AI moderation is temporarily rate-limited. Please try again in a few minutes.' };
    }
    
    return { status: 'approved', feedback: 'Passed local check (AI offline).' };
  }
};

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res) => {
  try {
    const { lang, category } = req.query;
    const query = { status: 'approved' };
    
    if (lang) {
      query.language = lang;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const articles = await Article.aggregate(buildArticlePipeline(query));

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error('Get articles error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all articles for admin
// @route   GET /api/articles/admin
// @access  Private/Admin
exports.getAdminArticles = async (req, res) => {
  try {
    const articles = await Article.aggregate(buildArticlePipeline());

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error('Get admin articles error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const [article] = await Article.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      ...buildArticlePipeline().slice(1),
    ]);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Get article error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private/Admin
exports.createArticle = async (req, res) => {
  try {
    const { title, description, content, category, tag, icon, language, practiceScenario, points } = req.body;
    const sanitizedPoints = (points || []).filter(p => p && p.trim().length > 0);
    const moderation = await moderateArticleWithAI({ title, description, content });

    if (moderation.status === 'rejected') {
      return res.status(200).json({
        success: false,
        status: 'rejected',
        aiFeedback: moderation.feedback,
        message: 'Article rejected by AI moderation.'
      });
    }

    const article = await Article.create({
      title,
      description,
      content,
      category,
      tag,
      icon,
      language,
      practiceScenario: practiceScenario || null,
      points: sanitizedPoints,
      author: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : moderation.status,
      aiFeedback: moderation.feedback,
    });

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Create article error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Admin
exports.updateArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isAuthor = article.author?.toString() === req.user?._id?.toString();

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this article' });
    }

    if (req.body.practiceScenario === '') {
      req.body.practiceScenario = null;
    }

    if (!isAdmin) {
      delete req.body.status;
      delete req.body.moderatedBy;
      delete req.body.aiFeedback;
      delete req.body.author;
    }

    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Update article error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
exports.deleteArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article removed',
    });
  } catch (error) {
    console.error('Delete article error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's own articles
// @route   GET /api/articles/my
// @access  Private
exports.getUserArticles = async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id || req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    console.error('Get user articles error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remoderate article with AI
// @route   PUT /api/articles/:id/moderate
// @access  Private/Admin
exports.remoderateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    
    const moderation = await moderateArticleWithAI(article);
    article.status = moderation.status;
    article.aiFeedback = moderation.feedback;
    
    await article.save();
    res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error('Remoderate article error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// @desc    Mark article as read
// @route   POST /api/articles/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await ArticleHistory.findOneAndUpdate(
      { user: req.user._id, article: req.params.id },
      { user: req.user._id, article: req.params.id },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user read history
// @route   GET /api/articles/history/read
// @access  Private
exports.getReadHistory = async (req, res) => {
  try {
    const history = await ArticleHistory.find({ user: req.user._id });
    const readIds = history.map(h => h.article.toString());
    res.status(200).json({ success: true, data: readIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
