import express from 'express';
import AdminController from '../controllers/admin.js';
import authMiddleware from '../middlewares/authorize.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/films-analytics', AdminController.getFilmAnalytics);
router.get('/revenue-analytics', AdminController.getRevenueAnalytics);
router.get('/top-users', AdminController.getTopUsers);
router.get('/showtime-stats', AdminController.getShowtimeStats);


export default router;