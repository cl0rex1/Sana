const Article = require('../models/Article');

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

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .populate('practiceScenario', 'title icon');


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

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'username')
      .populate('practiceScenario');

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

    const article = await Article.create({
      title,
      description,
      content,
      category,
      tag,
      icon,
      language,
      practiceScenario: practiceScenario || null,
      points: points || [],
      author: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
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
    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
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
