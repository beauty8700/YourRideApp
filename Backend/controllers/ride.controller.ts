import rideModel from '../models/ride.model.js';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
// import crypto from 'crypto'; // Not strictly needed for now but good for OTP

export const createRide = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, fare } = req.body;

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const ride = await rideModel.create({
            user: req.user._id,
            pickup,
            destination,
            fare,
            otp
        });

        res.status(201).json(ride);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating ride' });
    }
}

export const getRideDetails = async (req: Request, res: Response) => {
    const { rideId } = req.params;
    try {
        const ride = await rideModel.findById(rideId).populate('user').populate('driver');
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching ride' });
    }
}

export const acceptRide = async (req: any, res: Response) => {
    const { rideId } = req.body;
    try {
        const ride = await rideModel.findByIdAndUpdate(rideId, {
            driver: req.driver._id,
            status: 'accepted'
        }, { new: true });
        
        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: 'Error accepting ride' });
    }
}

export const startRide = async (req: any, res: Response) => {
    const { rideId, otp } = req.body;
    try {
        const ride = await rideModel.findOne({ _id: rideId, otp }).select('+otp');
        if (!ride) return res.status(400).json({ message: 'Invalid OTP' });
        
        ride.status = 'ongoing';
        await ride.save();
        
        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: 'Error starting ride' });
    }
}
