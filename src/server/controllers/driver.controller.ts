import { Driver } from '../models/driver.model.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const registerDriver = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isDriverAlreadyExist = await Driver.findOne({ email });

    if (isDriverAlreadyExist) {
        return res.status(400).json({ message: 'Driver already exist' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = new Driver({
        fullname,
        email,
        password: hashedPassword,
        vehicle
    });

    await driver.save();

    const token = jwt.sign({ _id: driver._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, driver });
};

export const loginDriver = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).select('+password');

    if (!driver) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, driver.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ _id: driver._id }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token);

    res.status(200).json({ token, driver });
};

export const getDriverProfile = async (req: any, res: any) => {
    res.status(200).json(req.driver);
};

export const logoutDriver = async (req: any, res: any) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
};
