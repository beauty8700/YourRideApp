import { User } from '../models/user.model.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const registerUser = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    const isUserAlreadyExist = await User.findOne({ email });
    if (isUserAlreadyExist) {
        return res.status(400).json({ message: 'User already exist' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        fullname,
        email,
        password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, user });
};

export const loginUser = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token);

    res.status(200).json({ token, user });
};

export const getUserProfile = async (req: any, res: any) => {
    res.status(200).json(req.user);
};

export const logoutUser = async (req: any, res: any) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
};
