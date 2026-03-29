require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Only declare this once!
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// 1. Connect Database
connectDB().catch(err => console.error("Database connection error:", err));

// 2. Middleware & CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://thefolio-project-gamma.vercel.app', // Your actual Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 3. Static Files (Note: Vercel is read-only; use Cloudinary for real uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API is running!');
});

// 5. Start Server logic for Render/Local
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

module.exports = app;
