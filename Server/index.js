const express = require('express');

const app = express();

const userRoute = require('./routes/User');
const courseRoute = require('./routes/Course');
const paymentRoute = require('./routes/Payment');
const profileRoute = require('./routes/Profile');

const database= require('./config/database');
const cookieParser = require('cookie-parser'); 
const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT || 4000;

//  database connect
database.connect();


// middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173", // dev
  "http://localhost:3000", // dev
  "https://study-notion-navy-seven.vercel.app", // your Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));


//  cloudinary connections
cloudinaryConnect();


//  routes
app.use('/api/v1/auth', userRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/course', courseRoute);


//  Default Route

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is up and running!',
  });
});

app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.redirect('https://study-notion-navy-seven.vercel.app');
  } else {
    res.send('Backend is running locally.');
  }
});



app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));