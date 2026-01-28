import express from 'express';
import BookingsController from '../controllers/bookings.js';
import authMiddleware from '../middlewares/authorize.js';
import bookingValidation from '../schemas/booking.schemas.js';
import validate from '../middlewares/validation.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', BookingsController.getUserBookings);
router.get('/history', BookingsController.getBookingHistory);
router.get('/:id', BookingsController.getOne);
router.post(
  '/',
  validate({ body: bookingValidation.create.body }),
  BookingsController.create
);
router.delete('/:id/cancel', BookingsController.cancel);

export default router;