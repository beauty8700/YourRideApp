import express from 'express';
import { body } from 'express-validator';
import * as rideController from '../controllers/ride.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', 
    authMiddleware.authUser,
    [
        body('pickup').isString().notEmpty(),
        body('destination').isString().notEmpty(),
        body('fare').optional().isNumeric(),
        body('vehicleType').optional().isIn(['bike', 'auto', 'mini', 'sedan']),
        body('distance').optional().isNumeric(),
        body('duration').optional().isNumeric(),
    ],
    rideController.createRide
);

router.post('/accept', [
    authMiddleware.authDriver,
    body('rideId').isString().notEmpty(),
], rideController.acceptRide);

router.post('/cancel', [
    authMiddleware.authUser,
    body('rideId').isString().notEmpty(),
    body('reason').optional().isString()
], rideController.cancelRide);

router.post('/start-ride', [
    authMiddleware.authDriver,
    body('rideId').isString().notEmpty(),
    body('otp').isString().isLength({ min: 6, max: 6 })
], rideController.startRide);

router.post('/complete', [
    authMiddleware.authDriver,
    body('rideId').isString().notEmpty(),
], rideController.completeRide);

router.get('/active/user', authMiddleware.authUser, rideController.getActiveUserRide);

router.get('/active/driver', authMiddleware.authDriver, rideController.getActiveDriverRide);

router.get('/:rideId', authMiddleware.authUser, rideController.getRideDetails);

export default router;
