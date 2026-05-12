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
        body('fare').isNumeric()
    ],
    rideController.createRide
);

router.post('/accept', authMiddleware.authDriver, rideController.acceptRide);

router.post('/start-ride', authMiddleware.authDriver, rideController.startRide);

router.get('/:rideId', authMiddleware.authUser, rideController.getRideDetails);

export default router;
