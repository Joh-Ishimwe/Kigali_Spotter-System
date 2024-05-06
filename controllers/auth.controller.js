import UserModel from "../models/user.model.js";
import configrations from '../configs/index.js'
import { requireAdmin } from "../middlewares/auth.js";
import { requireUser } from "../middlewares/auth.js";
import { BadRequestError } from "../errors/index.js";
import { UnauthorizedError } from "../errors/index.js";
import { validationResult } from "express-validator";
import path from "path"


import Spot from '../models/spot.model.js';



export const createSpot = async (req, res, next) => {
    try {
        // Check if required fields are present in the request body
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
         }

        // Create a new spot
        const newSpot = new Spot({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            location: req.body.location,
            image: req.file.filename,
            path:req.file.path 
        });

        // Save the spot to the database
        const savedSpot = await newSpot.save();

        res.status(201).json({
            message: 'Spot created successfully',
            spot: savedSpot,
        });
    } catch (error) {
        console.log(error);
        next(error); // Pass errors to the error handler middleware
    }
};


export const updateSpot = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Request Body:", req.body); // Log the request body for debugging

        // Check if the spot exists
        const spot = await Spot.findById(id);
        if (!spot) {
            throw new NotFoundError('Spot not found');
        }

        // Update the spot
        const updatedSpot = await Spot.findByIdAndUpdate(id, req.body, { new: true });
        console.log("Updated Spot:", updatedSpot); // Log the updated spot for debugging

        res.status(200).json({
            message: 'Spot updated successfully',
            spot: updatedSpot,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSpot = (async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the spot exists
        const spot = await Spot.findById(id);
        if (!spot) {
            throw new NotFoundError('Spot not found');
        }

        // Delete the spot
        await Spot.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Spot deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});
