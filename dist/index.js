"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const userRoutes = require('./routes/userRoute');
const adminRoutes = require('./routes/adminRoutes');
const counselorRoutes = require('./routes/counselorRoute');
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(cors({
    credentials: true,
    origin: ['https://emocare-health.vercel.app/']
}));
app.use('/uploads', express.static('uploads'));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "uploads")));
const storage = multer.diskStorage({});
app.use(cookieParser());
app.use(express.json());
app.use('/', userRoutes);
app.use('/counselor', counselorRoutes);
app.use('/admin', adminRoutes);
mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
}).then(() => {
    console.log("connected to database");
    app.listen(5000, () => {
        console.log("app is listening to the port 5000");
    });
}).catch(err => {
    console.error("error connecting to database", err);
});
