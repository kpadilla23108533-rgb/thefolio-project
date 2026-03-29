require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// 1. Connect Database (Non-blocking for Vercel)
connectDB().catch(err => console.error("Database connection error:", err));

// 2. Middleware
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-url.vercel.app' // Add your actual Vercel URL here
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 3. Static Files
// Note: Local uploads won't persist on Vercel. Consider Cloudinary for production.
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// 4. API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', message: '🚀 API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// Root route (Important: Keep this simple for testing)
app.get('/', (req, res) => {
  res.send('🚀 API is running and healthy!');
});

// 5. Error Handling
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// 6. Start Server (Only for Local/Render, NOT for Vercel functions)
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

module.exports = app; // Critical for Vercel
