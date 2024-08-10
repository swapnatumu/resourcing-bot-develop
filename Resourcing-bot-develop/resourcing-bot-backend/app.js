import express from "express";
import User from "./routers/User.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";


 const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret:  '5401f0bec35816fc6cd61d303ff4f7ad4ba5ec6613039d74',
  resave: false,
  saveUninitialized: true,
}));

app.use(cors({
    // origin: '*', 

    origin: 'http://10.10.1.46:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
 
  }));


// const allowedOrigins = [ '*'];
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.includes(origin)) {
//       callback(null, origin);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   allowedHeaders: 'Content-Type,Authorization',
// };

// app.use(cors(corsOptions));






const PORT = process.env.PORT;



app.use("/api", User);



app.get("/", (req, res) => {
  res.send(`Server is running on port ${PORT}`);});
export { app };