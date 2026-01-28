import Comments from '../models/Comment.js';

export default {

  async addComment(req, res, next) {
    try {
      const user_id = req.userId;
      const { movie_id, rating, comment_text } = req.body;

      const comment = await Comments.create({ user_id, movie_id, rating, comment_text });
        
      res.status(201).json({ status: 'ok', data: comment });
    } catch (error) {
      next(error);
    }
  },

  async editComment(req, res, next) {
    try {
      const user_id = req.userId;
      const { id } = req.params;
      const { comment_text, rating } = req.body;

      const updated = await Comments.update(id, user_id, { comment_text, rating });

      res.json({ status: 'ok', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteComment(req, res, next) {
    try {
      const user_id = req.userId;
      const { id } = req.params;

      await Comments.remove(id, user_id);

      res.json({ status: 'ok', message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  },

  async getComments(req, res, next) {
    try {
      const { movie_id } = req.params;
      const { page, sort } = req.query;

      const data = await Comments.findByMovie(movie_id, { page: parseInt(page) || 1, sort });

      res.json({ status: 'ok', data });
    } catch (error) {
      next(error);
    }
  },

  async getAllAdmin(req, res, next) {
    try {
      const { page, status } = req.query;
      const comments = await Comments.findAllAdmin({ page: parseInt(page) || 1, status });
      res.json({ status: 'ok', data: comments });
    } catch (error) {
      next(error);
    }
  },

  async moderate(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await Comments.moderate(id, status);

      res.json({ status: 'ok', message: `Comment ${status}` });
    } catch (error) {
      next(error);
    }
  }

};
