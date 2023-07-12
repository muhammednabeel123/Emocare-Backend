const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const multer = require('multer');
const path = require('path')
const userRoutes = require('./routes/userRoute')
const adminRoutes = require('./routes/adminRoutes')
const counselorRoutes = require('./routes/counselorRoute')

const app = express()
app.use(cors({
    credentials:true,
    origin:['http://localhost:4200']
}))

app.use('/uploads', express.static('uploads'));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,"uploads")));

const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'uploads/') 
  // },
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname) 
  // }
});


app.use(cookieParser())
app.use(express.json())


app.use('/',userRoutes)
app.use('/counselor',counselorRoutes)
app.use('/admin',adminRoutes)

mongoose.connect("mongodb://127.0.0.1:27017/Emocare", {
    useNewUrlParser:true,
}).then(() => {
  console.log("connected to database");
  app.listen(5000, () => {
    console.log("app is listening to the port 5000");
  });
}).catch(err => {
  console.error("error connecting to database", err);
});
