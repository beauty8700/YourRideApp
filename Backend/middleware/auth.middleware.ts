import userModel from "../models/user.model.js";
import driverModel from "../models/driver.model.js";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authUser = async (req: any, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

export const authDriver = async (req: any, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
        const driver = await driverModel.findById(decoded._id);

        if (!driver) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.driver = driver;
        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
