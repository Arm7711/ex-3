import express from 'express';
import MoviesController from '../controllers/movies.js';
import authMiddleware from '../middlewares/authorize.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import movieValidation from '../schemas/movie.schemas.js';
import validate from '../middlewares/validation.js';

const router = express.Router();


router.get('/', MoviesController.getAll);
router.get('/:id', MoviesController.getOne);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  validate({ body: movieValidation.create.body }),
  MoviesController.create
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  validate({ body: movieValidation.update.body }),
  MoviesController.update
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  MoviesController.remove
);

export default router;