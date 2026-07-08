const Article = require('../models/Article');
const cloudinary = require('../config/cloudinary');

// @desc    Get all published articles (public)
// @route   GET /api/articles
exports.getArticles = async (req, res, next) => {
  try {
    const { category, tag, search, limit = 10, page = 1, featured, breaking } = req.query;
    const query = { status: 'published' };

    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag.toLowerCase()] };
    if (featured) query.isFeatured = true;
    if (breaking) query.isBreaking = true;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .populate('category', 'name slug')
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: articles.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: articles,
    });
  } catch (error) { next(error); }
};

// @desc    Get single article by slug (public)
// @route   GET /api/articles/:slug
exports.getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: 'published' })
      .populate('category', 'name slug')
      .populate('author', 'name avatar');
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    await article.incrementViews();
    res.json({ success: true, data: article });
  } catch (error) { next(error); }
};

// @desc    Get all articles for admin (all statuses)
// @route   GET /api/articles/admin/all
exports.getAdminArticles = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    // Writers can only see their own articles
    if (req.user.role === 'writer') query.author = req.user._id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .populate('category', 'name')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, count: articles.length, total, pages: Math.ceil(total / parseInt(limit)), data: articles });
  } catch (error) { next(error); }
};

// @desc    Create article
// @route   POST /api/articles
exports.createArticle = async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    const article = await Article.create(req.body);
    res.status(201).json({ success: true, data: article });
  } catch (error) { next(error); }
};

// @desc    Update article
// @route   PUT /api/articles/:id
exports.updateArticle = async (req, res, next) => {
  try {
    let article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    // Writers can only edit their own
    if (req.user.role === 'writer' && article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this article' });
    }
    article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: article });
  } catch (error) { next(error); }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    // Delete image from cloudinary
    if (article.featuredImage.publicId) {
      await cloudinary.uploader.destroy(article.featuredImage.publicId);
    }
    await article.deleteOne();
    res.json({ success: true, message: 'Article deleted' });
  } catch (error) { next(error); }
};

// @desc    Get related articles
// @route   GET /api/articles/:id/related
exports.getRelated = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    const related = await Article.find({
      _id: { $ne: article._id },
      category: article.category,
      status: 'published',
    }).limit(4).populate('category', 'name slug').populate('author', 'name');
    res.json({ success: true, data: related });
  } catch (error) { next(error); }
};
