import express from 'express';
import authMiddleware from '../middlewares/authorize.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import CommentController from '../controllers/comments.js';

const router = express.Router();

router.post('/', authMiddleware, CommentController.addComment);
router.put('/:id', authMiddleware, CommentController.editComment);
router.delete('/:id', authMiddleware, CommentController.deleteComment);
router.get('/movie/:movie_id', CommentController.getComments);


router.get('/', authMiddleware, adminMiddleware, CommentController.getAllAdmin);
router.put('/:id/moderate', authMiddleware, adminMiddleware, CommentController.moderate);

export default router;
