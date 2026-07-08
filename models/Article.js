const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  slug: { type: String, unique: true },
  excerpt: { type: String, required: [true, 'Excerpt is required'], maxlength: 300 },
  content: { type: String, required: [true, 'Content is required'] },
  featuredImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: String, lowercase: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  isBreaking: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: [{ type: String }],
  },
  embeddedVideo: { type: String, default: '' }, // YouTube embed URL
}, { timestamps: true });

// Auto generate slug from title
articleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Increment views
articleSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

module.exports = mongoose.model('Article', articleSchema);
