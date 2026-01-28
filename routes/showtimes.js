import express from 'express';
import ShowtimesController from '../controllers/showtimes.js';
import authMiddleware from '../middlewares/authorize.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import showtimeValidation from '../schemas/showtime.schemas.js';
import validate from '../middlewares/validation.js';

const router = express.Router();


router.get('/', ShowtimesController.getAll);
router.get('/:id', ShowtimesController.getOne);
router.get('/:id/seats/available', ShowtimesController.getAvailableSeats);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  validate({ body: showtimeValidation.create.body }),
  ShowtimesController.create
);

export default router;