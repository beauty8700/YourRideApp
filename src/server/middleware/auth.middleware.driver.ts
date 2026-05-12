import { Driver } from '../models/driver.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authDriver = async (req: any, res: any, next: any) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[ 1 ];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const driver = await Driver.findById(decoded._id);

        if (!driver) {
            return res.status(401).json({ message: 'Driver not found' });
        }

        req.driver = driver;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
