import express from 'express';
import userRoutes from './users.js';
import movieRoutes from './movies.js';
import showtimeRoutes from './showtimes.js';
import bookingRoutes from './bookings.js';
import adminRoutes from './admin.js';
import commentsRoutes from './comments.js'

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Theatre Booking System API',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
      showtimes: '/api/showtimes',
      bookings: '/api/bookings',
      admin: '/api/admin'
    }
  });
});

router.use('/api/auth', userRoutes);
router.use('/api/movies', movieRoutes);
router.use('/api/showtimes', showtimeRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/comments', commentsRoutes)

export default router;