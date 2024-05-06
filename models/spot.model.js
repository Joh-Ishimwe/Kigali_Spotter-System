import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['attraction', 'restaurant', 'hotel', 'shop'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: false
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

const Spot = mongoose.model('Spot', spotSchema);

export default Spot;
