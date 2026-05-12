import driverModel from '../models/driver.model.js';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

export const registerDriver = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isDriverAlready = await driverModel.findOne({ email });

    if (isDriverAlready) {
        return res.status(400).json({ message: 'Driver already exist' });
    }

    const hashedPassword = await (driverModel as any).hashPassword(password);

    const driver = await driverModel.create({
        fullname: {
            firstname: fullname.firstname,
            lastname: fullname.lastname
        },
        email,
        password: hashedPassword,
        vehicle: {
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        }
    });

    const token = (driver as any).generateAuthToken();

    res.status(201).json({ token, driver });
}

export const loginDriver = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const driver = await driverModel.findOne({ email }).select('+password');

    if (!driver) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await (driver as any).comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = (driver as any).generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, driver });
}

export const getDriverProfile = async (req: any, res: Response) => {
    res.status(200).json(req.driver);
}

export const logoutDriver = async (req: any, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
}
