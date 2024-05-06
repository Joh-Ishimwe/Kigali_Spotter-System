import dotenv from "dotenv";
dotenv.config();

import swaggerUi from 'swagger-ui-express';
import swagger from './docs/swagger.json' assert {type: "json"}

import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import mongoose from "mongoose";
import configurations from "./configs/index.js";
//import router from "./routes/login.route.js";
import ErrorHandler from "./middlewares/ErrorHandler.js";
import allRouter from "./routes/user.routes.js"



const app = express();


app.use(cors());
app.use(express.json());
app.use('/api/v1', allRouter);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swagger));
//app.use( router);

mongoose.connect(configurations.MONGODB_CONNECTION_STRING)
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(configurations.PORT, () => {
        console.log(`Server is running on port ${configurations.PORT}`);
    })
})
.catch(err => {
    console.log(err);
})



app.use(ErrorHandler);