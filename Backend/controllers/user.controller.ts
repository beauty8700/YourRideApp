import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password } = req.body;

        const normalizedEmail = String(email).trim().toLowerCase();
        const isUserAlready = await userModel.findOne({ email: normalizedEmail });

        if (isUserAlready) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await (userModel as any).hashPassword(password);

        const user = await userModel.create({
            fullname: {
                firstname: String(fullname.firstname).trim(),
                lastname: fullname.lastname ? String(fullname.lastname).trim() : ''
            },
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = (user as any).generateAuthToken();

        return res.status(201).json({ token, user });
    } catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({
                message: 'Duplicate value error',
                field: Object.keys(err.keyPattern || {})[0] || null
            });
        }

        console.error('registerUser error:', err);
        return res.status(500).json({ message: 'Error registering user' });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email: String(email).trim().toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await (user as any).comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = (user as any).generateAuthToken();

        res.cookie('token', token);

        return res.status(200).json({ token, user });
    } catch (err) {
        console.error('loginUser error:', err);
        return res.status(500).json({ message: 'Error logging in user' });
    }
}

export const getUserProfile = async (req: any, res: Response) => {
    res.status(200).json(req.user);
}

export const logoutUser = async (req: any, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
}
