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
app.use(cors({origin:'http://localhost:3000', credentials: true }));
//ParseincomingJSONrequestbodies
app.use(express.json());
//Serveuploadedimagefilesaspublic URLs
//e.g.http://localhost:5000/uploads/my-image.jpg
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
//──Routes────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments',commentRoutes);
app.use('/api/admin', adminRoutes);
//──StartServer──────────────────────────────────────────────
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
console.log(`Serverisrunningonhttp://localhost:${PORT}`);
});
