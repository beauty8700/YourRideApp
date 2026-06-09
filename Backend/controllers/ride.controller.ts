import rideModel from '../models/ride.model.js';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

type VehicleType = 'bike' | 'auto' | 'mini' | 'sedan';

const fareMultiplierByVehicle: Record<VehicleType, number> = {
    bike: 0.8,
    auto: 1,
    mini: 1.3,
    sedan: 1.8,
};

const estimateFare = (distanceKm: number, vehicleType: VehicleType) => {
    const baseFare = 25;
    const perKm = 12;
    const multiplier = fareMultiplierByVehicle[vehicleType] || fareMultiplierByVehicle.mini;
    return Number((baseFare + (distanceKm * perKm * multiplier)).toFixed(2));
};

export const createRide = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, fare, vehicleType, distance, duration } = req.body;

    try {
        const incomingVehicleType = String(vehicleType || 'mini').toLowerCase();
        const normalizedVehicleType: VehicleType =
            incomingVehicleType === 'bike'
                ? 'bike'
                : incomingVehicleType === 'auto'
                    ? 'auto'
                    : incomingVehicleType === 'sedan'
                        ? 'sedan'
                        : 'mini';
        const distanceKm = Number.isFinite(Number(distance)) ? Number(distance) : 8;
        const durationMinutes = Number.isFinite(Number(duration)) ? Number(duration) : 20;
        const computedFare = estimateFare(distanceKm, normalizedVehicleType);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const ride = await rideModel.create({
            user: req.user._id,
            pickup,
            destination,
            fare: Number.isFinite(Number(fare)) && Number(fare) > 0 ? Number(fare) : computedFare,
            vehicleType: normalizedVehicleType,
            distance: distanceKm,
            duration: durationMinutes,
            otp
        });

        return res.status(201).json(ride);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error creating ride' });
    }
}

export const getRideDetails = async (req: any, res: Response) => {
    const { rideId } = req.params;
    try {
        const ride = await rideModel.findById(rideId).populate('user').populate('driver');
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        if (String(ride.user._id) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Access denied for this ride' });
        }

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching ride' });
    }
}

export const getActiveUserRide = async (req: any, res: Response) => {
    try {
        const ride = await rideModel
            .findOne({
                user: req.user._id,
                status: { $in: ['pending', 'accepted', 'ongoing'] }
            })
            .sort({ createdAt: -1 })
            .populate('driver');

        if (!ride) {
            return res.status(404).json({ message: 'No active ride found' });
        }

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching active ride' });
    }
}

export const getActiveDriverRide = async (req: any, res: Response) => {
    try {
        const ride = await rideModel
            .findOne({
                driver: req.driver._id,
                status: { $in: ['accepted', 'ongoing'] }
            })
            .sort({ createdAt: -1 })
            .populate('user');

        if (!ride) {
            return res.status(404).json({ message: 'No active ride found' });
        }

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching active ride' });
    }
}

export const acceptRide = async (req: any, res: Response) => {
    const { rideId } = req.body;
    try {
        const ride = await rideModel.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== 'pending') {
            return res.status(409).json({ message: `Cannot accept a ${ride.status} ride` });
        }

        ride.driver = req.driver._id;
        ride.status = 'accepted';
        await ride.save();

        const populatedRide = await rideModel.findById(ride._id).populate('user').populate('driver');
        return res.status(200).json(populatedRide);
    } catch (err) {
        return res.status(500).json({ message: 'Error accepting ride' });
    }
}

export const startRide = async (req: any, res: Response) => {
    const { rideId, otp } = req.body;
    try {
        const ride = await rideModel.findById(rideId).select('+otp');
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        if (!ride.driver || String(ride.driver) !== String(req.driver._id)) {
            return res.status(403).json({ message: 'You are not assigned to this ride' });
        }

        if (ride.status !== 'accepted') {
            return res.status(409).json({ message: `Cannot start a ${ride.status} ride` });
        }

        if (String(ride.otp) !== String(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        ride.status = 'ongoing';
        ride.startedAt = new Date();
        await ride.save();

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: 'Error starting ride' });
    }
}

export const completeRide = async (req: any, res: Response) => {
    const { rideId } = req.body;

    try {
        const ride = await rideModel.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        if (!ride.driver || String(ride.driver) !== String(req.driver._id)) {
            return res.status(403).json({ message: 'You are not assigned to this ride' });
        }

        if (!['accepted', 'ongoing'].includes(ride.status)) {
            return res.status(409).json({ message: `Cannot complete a ${ride.status} ride` });
        }

        if (!ride.startedAt) {
            ride.startedAt = new Date();
        }
        ride.status = 'completed';
        ride.completedAt = new Date();
        await ride.save();

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: 'Error completing ride' });
    }
}

export const cancelRide = async (req: any, res: Response) => {
    const { rideId, reason } = req.body;

    try {
        const ride = await rideModel.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        if (String(ride.user) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can cancel only your own ride' });
        }

        if (ride.status === 'completed' || ride.status === 'cancelled') {
            return res.status(409).json({ message: `Ride already ${ride.status}` });
        }

        if (ride.status === 'ongoing') {
            return res.status(409).json({ message: 'Ongoing rides cannot be cancelled' });
        }

        ride.status = 'cancelled';
        ride.cancelReason = reason || 'Cancelled by user';
        await ride.save();

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: 'Error cancelling ride' });
    }
}
