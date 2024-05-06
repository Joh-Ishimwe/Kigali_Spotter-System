import UserModel from "../models/user.model.js";
import Spot from "../models/spot.model.js";
import Review from "../models/review.model.js"
import asyncWrapper from "../middlewares/async.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Token from '../models/token.model.js';
import configrations from '../configs/index.js'
import { sendEmail } from "../utils/sendEmail.js";
import { otpGenerator } from "../utils/otp.js";
import { BadRequestError } from "../errors/index.js";
import { UnauthorizedError } from "../errors/index.js";
import { validationResult } from "express-validator";

export const SignUp = asyncWrapper(async(req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new BadRequestError(errors.array()[0].msg));
    }

    // Checking if the user is already in using the email
    const foundUser = await UserModel.findOne({ email: req.body.email });
    if (foundUser) {
        return next(new BadRequestError("Email already in use"));
    };

    // Harshing the user password
    const hashedPassword = await bcryptjs.hashSync(req.body.password, 10);
    // Generating OTP
    const otp = otpGenerator();
    const otpExpirationDate = new Date().getTime() + (60 * 1000 * 5);

    // Recording the user to the database
    const newUser = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        otp:otp,
        expiresIn: otpExpirationDate,
        password: hashedPassword
    });

    const savedUser = await newUser.save();
    // console.log(savedUser);

     sendEmail(req.body.email, "Verify your account", `Your OTP is ${otp}`);

    if (savedUser) {
        return res.status(201).json({
            message: "User account created!",
            user: savedUser
        });
    }
});

export const ValidateOpt = asyncWrapper(async (req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new BadRequestError(errors.array()[0].msg));
    }

    // Checking if the given opt is stored in our database
    const foundUser = await UserModel.findOne({ otp: req.body.otp });
    if (!foundUser) {
        next(new UnauthorizedError('Authorization denied'));
    };

    // Checking if the otp is expired or not.
    if (foundUser.otpExpires < new Date().getTime()) {
        next(new UnauthorizedError('OTP expired'));
    }

    // Updating the user to verified
    foundUser.verified = true;
    const savedUser = await foundUser.save();

    if (savedUser) {
        return res.status(201).json({
            message: "User account verified!",
            user: savedUser
        });
    }
});

export const SignIn = asyncWrapper(async (req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new BadRequestError(errors.array()[0].msg));
    }

    // Find user
    const foundUser = await UserModel.findOne({ email: req.body.email });
    if (!foundUser) {
        return next(new BadRequestError("Invalid email or password!"));
    };

    // Check account verification
    if (!foundUser.verified) {
        return next(new BadRequestError("Your account is not verified!"));
    }

    // Verify password
    const isPasswordVerfied = await bcryptjs.compareSync(req.body.password, foundUser.password);
    if (!isPasswordVerfied) {
        return next(new BadRequestError("Invalid email or password!"));
    }

    // Generate token
    const token = jwt.sign(
        { id: foundUser.id, email: foundUser.email },
        process.env.JWT_SECRET_KEY, // Ensure this is correctly configured in your environment
        { expiresIn: "1h" });

    res.status(200).json({
        message: "User logged in!",
        token: token,
        user: foundUser
    });
});


export const ForgotPassword = asyncWrapper(async (req, res, next) =>{
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new BadRequestError(errors.array()[0].msg));
    }

    // Find user
    const foundUser = await UserModel.findOne({ email: req.body.email });
    if (!foundUser) {
        return next(new BadRequestError("Your email is not registered!"));
    };

    // Generate token
    const token = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });

    // Recording the token to the database
    
    await Token.create({
        token: token,
        user: foundUser._id,
        expirationDate: new Date().getTime() + (15 * 60 * 1000), // 15 minutes expiration
    
    });

    const link = `http://localhost:8080/reset-password?token=${token}&id=${foundUser.id}`;
    const emailBody = `Click on the link bellow to reset your password\n\n${link}`;

     sendEmail(req.body.email, "Reset your password", emailBody);
    

    res.status(200).json({
        message: "We sent you a reset password link on your email!",
    });
});

export const ResetPassword = asyncWrapper(async (req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new BadRequestError(errors.array()[0].msg));
    };

    // Verify token
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
        return next(new BadRequestError("Invalid token!"));
    }

    const recordedToken = await Token.findOne({ token: req.body.token });
    
    if (decoded.id!= req.body.id || recordedToken.user!= req.body.id) {
        return next(new BadRequestError("Invalid token!"));
    }

    if (new Date(recordedToken.expirationDate).getTime() < new Date().getTime()) {
        return next(new BadRequestError("Token expired!"));
    }

    // Find user
    const foundUser = await UserModel.findById(req.body.id);
    if (!foundUser) {
        return next(new BadRequestError("User not found!"));
    };

    // Deleting the user token
    await Token.deleteOne({ token: req.body.token });

    // Harshing the user password
    const hashedPassword = await bcryptjs.hashSync(req.body.password, 10);

    // Updating the user password
    foundUser.password = hashedPassword;

    const savedUser = await foundUser.save();
    if (savedUser) {
        return res.status(200).json({
            message: "Your password has been reset!",
        })
    }
});

// Function to get all spots with optional filtering by location and category
export const allSpots = async (req, res, next) => {
    try {
        let filter = {};

        // Check if location filter is provided
        if (req.query.location) {
            filter.location = req.query.location;
        }

        // Check if category filter is provided
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Get spots based on filters
        const spots = await Spot.find(filter);
        
        res.status(200).json({
            message: 'List of all Spots',
            spots: spots
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Server error" });
    }
};




// Function to create a review for a spot


export const createReview = asyncWrapper(async (req, res, next) => {
    try {
        const { spotId, rating, comment } = req.body;

        // Check if required fields are present
        if (!spotId || !rating || !comment) {
           throw new BadRequestError('Missing required fields');
        }

        // Create a new review
        const newReview = new Review({
            user: req.user.id, // Assuming user ID is available in the request
            spot: spotId,
            rating,
            comment,
        });

        // Save the review to the database
        const savedReview = await newReview.save();

        // Push the review's ID into the spot's reviews array
        const spot = await Spot.findByIdAndUpdate(spotId, { $push: { reviews: savedReview._id } }, { new: true });

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: savedReview,
        });
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

// Function to get a spot by its ID
export const getSpotById = asyncWrapper(async (req, res, next) => {
    try {
        const { id } = req.params;
        const spot = await Spot.findById(id).populate('reviews');

        if (!spot) {
            throw new NotFoundError('Spot not found');
        }

        res.status(200).json({
            message: 'Spot found',
            spot: spot
        });
    } catch (error) {
        next(error);
    }
});
