// backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: '' // filename stored in uploads/
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['published', 'removed'],
      default: 'published'
    }
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Post', postSchema);
