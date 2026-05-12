import express from 'express';
import { body } from 'express-validator';
import { registerDriver, loginDriver, getDriverProfile, logoutDriver } from '../controllers/driver.controller.js';
import { authDriver } from '../middleware/auth.middleware.driver.js';

const router = express.Router();

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType').isIn(['bike', 'auto', 'car']).withMessage('Invalid vehicle type')
], registerDriver);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], loginDriver);

router.get('/profile', authDriver, getDriverProfile);

router.get('/logout', authDriver, logoutDriver);

export default router;
