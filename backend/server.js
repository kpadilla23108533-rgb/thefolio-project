//backend/server.js
require('dotenv').config(); // Load .env variables FIRST
const express =require('express');
const cors =require('cors');
const path =require('path');
const connectDB=require('./config/db');
//Importroutes(youwillcreatethese files in the next steps)
const authRoutes =require('./routes/auth.routes');
const postRoutes =require('./routes/post.routes');
const commentRoutes=require('./routes/comment.routes');
const adminRoutes =require('./routes/admin.routes');
const app=express();
connectDB(); //ConnecttoMongoDB
//──Middleware─────────────────────────────────────────────────
//AllowReact(port3000)tocall this server
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
//ParseincomingJSONrequestbodies
app.use(express.json());
//Serveuploadedimagefilesaspublic URLs
//e.g.http://localhost:5000/uploads/my-image.jpg
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});
//──Routes────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments',commentRoutes);
app.use('/api/admin', adminRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});
//──StartServer──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
// Listen on 0.0.0.0 to allow Render's proxy to find your app
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
app.get('/', (req, res) => {
  res.send('🚀 API is running and healthy!');
});
