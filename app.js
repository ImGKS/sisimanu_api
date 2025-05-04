const express = require('express');
const connectDB = require("./config/database");
const cookieParser = require('cookie-parser')
const cors = require('cors')
const http = require('http');
const serverless = require('serverless-http');

const app = express();
app.use(cors({
    origin: "https://sisimanu-web.vercel.app",
    credentials: true
}))
app.options('*', cors({
    origin: 'https://sisimanu-web.vercel.app',
    credentials: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://sisimanu-web.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    // mirror the methods & headers you expect:
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// convert JSON into js object so that node can read
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user');
const initializeSocket = require('./utils/socket');
const { chatRouter } = require('./routes/chat');
const { paymentRouter } = require('./routes/payment');



app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)
app.use("/", chatRouter)
app.use("/", paymentRouter)

const server = http.createServer(app);
initializeSocket(server)

connectDB()
    .then(()=>{
        console.log("DB connected successfully.")
        server.listen(3000, ()=>{
            console.log("Server is running at 3000")
        })
    }).catch((error)=>{
        console.log("ERROR : ", error)
    })

module.exports = serverless(app);
