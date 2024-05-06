import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    expirationDate: {
        type: Date,
        required: true,
    }
});

const Token = mongoose.model("Token", TokenSchema);
export default Token;