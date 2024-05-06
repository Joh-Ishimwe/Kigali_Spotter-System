import Review from '../models/review.model.js';
import Spot from '../models/spot.model.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';
import { requireUser, requireAdmin } from '../middlewares/auth.js';

// // Function to get all spots with optional filtering by location and category
// export const allSpots = async (req, res, next) => {
//     try {
//         let filter = {};

//         // Check if location filter is provided
//         if (req.query.location) {
//             filter.location = req.query.location;
//         }

//         // Check if category filter is provided
//         if (req.query.category) {
//             filter.category = req.query.category;
//         }

//         // Get spots based on filters
//         const spots = await Spot.find(filter);
        
//         res.status(200).json({
//             message: 'List of all Spots',
//             spots: spots
//         });
//     } catch (err) {
//         console.log(err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// // Function to get a spot by its ID
// export const getSpotById = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const spot = await Spot.findById(id);

//         if (!spot) {
//             throw new NotFoundError('Spot not found');
//         }

//         res.status(200).json({
//             message: 'Spot found',
//             spot: spot
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // Function to create a review for a spot
// export const createReview = requireUser(async (req, res, next) => {
//     try {
//         const { spotId, rating, comment } = req.body;

//         // Check if required fields are present
//         if (!spotId || !rating || !comment) {
//             throw new BadRequestError('Missing required fields');
//         }

//         // Create a new review
//         const newReview = new Review({
//             user: req.user.id, // Assuming user ID is available in the request
//             spot: spotId,
//             rating,
//             comment,
//         });

//         // Save the review to the database
//         const savedReview = await newReview.save();

//         res.status(201).json({
//             message: 'Review created successfully',
//             review: savedReview,
//         });
//     } catch (error) {
//         next(error);
//     }
// });
