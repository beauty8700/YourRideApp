import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'driver',
    },
    pickup: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ['bike', 'auto', 'mini', 'sedan'],
        default: 'mini',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
        default: 'pending',
    },
    duration: {
        type: Number,
    },
    distance: {
        type: Number,
    },
    cancelReason: {
        type: String,
    },
    startedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },
    otp: {
        type: String,
        select: false,
        required: true,
    },
}, { timestamps: true });

const rideModel = mongoose.model('ride', rideSchema);

export default rideModel;
