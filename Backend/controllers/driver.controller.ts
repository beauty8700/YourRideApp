import driverModel from '../models/driver.model.js';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

export const registerDriver = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, vehicle } = req.body;

        const normalizedEmail = String(email).trim().toLowerCase();
        const isDriverAlready = await driverModel.findOne({ email: normalizedEmail });

        if (isDriverAlready) {
            return res.status(409).json({ message: 'Driver already exists' });
        }

        const hashedPassword = await (driverModel as any).hashPassword(password);
        const normalizedCapacity = Number(vehicle.capacity);

        const driver = await driverModel.create({
            fullname: {
                firstname: String(fullname.firstname).trim(),
                lastname: fullname.lastname ? String(fullname.lastname).trim() : ''
            },
            email: normalizedEmail,
            password: hashedPassword,
            vehicle: {
                color: String(vehicle.color).trim(),
                plate: String(vehicle.plate).trim().toUpperCase(),
                capacity: normalizedCapacity,
                vehicleType: vehicle.vehicleType
            }
        });

        const token = (driver as any).generateAuthToken();

        return res.status(201).json({ token, driver });
    } catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({
                message: 'Duplicate value error',
                field: Object.keys(err.keyPattern || {})[0] || null
            });
        }

        console.error('registerDriver error:', err);
        return res.status(500).json({ message: 'Error registering driver' });
    }
}

export const loginDriver = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const driver = await driverModel.findOne({ email: String(email).trim().toLowerCase() }).select('+password');

        if (!driver) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await (driver as any).comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = (driver as any).generateAuthToken();

        res.cookie('token', token);

        return res.status(200).json({ token, driver });
    } catch (err) {
        console.error('loginDriver error:', err);
        return res.status(500).json({ message: 'Error logging in driver' });
    }
}

export const getDriverProfile = async (req: any, res: Response) => {
    res.status(200).json(req.driver);
}

export const logoutDriver = async (req: any, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
}
