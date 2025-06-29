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
app.use(cors({
    origin: [
    "https://studynotion-lms-qnvg.onrender.com", // original frontend (Render)
    "https://study-notion-navy-seven.vercel.app" // new frontend (Vercel)
    ],
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
    return res.status(200).json({
        success: true,
        message: "Server is running successfully"
    });
});


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));