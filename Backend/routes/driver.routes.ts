import express from 'express';
import { body } from 'express-validator';
import * as driverController from '../controllers/driver.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', [
    body('email').trim().isEmail().withMessage('Invalid Email').normalizeEmail(),
    body('fullname.firstname').trim().isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('fullname.lastname').optional({ values: 'falsy' }).trim().isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').trim().isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
    body('vehicle.plate').trim().isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity').toInt().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('Invalid vehicle type')
], driverController.registerDriver);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], driverController.loginDriver);

router.get('/profile', authMiddleware.authDriver, driverController.getDriverProfile);

router.get('/logout', authMiddleware.authDriver, driverController.logoutDriver);

export default router;
