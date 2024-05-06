import express from 'express';
const userRouter = express.Router();
import { SignUp, SignIn, ValidateOpt, ForgotPassword, ResetPassword, allSpots,getSpotById, createReview } from '../controllers/user.controller.js';
import { signUpValidations, signInValidations, otpValidation, forgotPasswordValidation, resetPasswordValidation } from '../utils/validation.js';
import {createSpot, updateSpot, deleteSpot} from '../controllers/auth.controller.js';
import { createSpotValidation } from '../utils/validation.js';
import authMiddleware from '../middlewares/auth.js';
//import { allSpots, getSpotById, createReview} from '../controllers/review.controller.js';
import upload from "/Users/HP/Desktop/ABCollector/Kigali_Spotter-System/utils/uploading.js";


userRouter.post('/signup', signUpValidations, SignUp);
userRouter.post('/signin', signInValidations, SignIn);
userRouter.post('/verify', otpValidation, ValidateOpt);
userRouter.post('/forgotPassword', forgotPasswordValidation, ForgotPassword);
userRouter.post('/resetPassword', resetPasswordValidation, ResetPassword);
userRouter.post('/createspot',upload.single("image") , createSpot); 
userRouter.patch('/updatespot/:id', updateSpot);
userRouter.delete('/deletespot/:id', deleteSpot);
userRouter.get('/spots', allSpots);
userRouter.get('/spots/:id', getSpotById); 
userRouter.post('/create-review', authMiddleware, createReview); 
export default userRouter;
