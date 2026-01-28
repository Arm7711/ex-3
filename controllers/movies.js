import Movies from '../models/movies.js';

export default {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const filters = {
        genre: req.query.genre || null,
        is_active: 1 
      };

      const options = {
        search: req.query.search || null,
        duration: req.query.duration || null,
        orderBy: req.query.sortBy || 'title',
        orderDirection: req.query.sortDirection || 'ASC',
        limit,
        offset
      };

      const movies = await Movies.findAll(filters, options);
      const totalResult = await Movies.count(filters, options);
      const total = totalResult.total || 0;
      const totalPages = Math.ceil(total / limit);

      res.json({
        status: 'ok',
        data: movies,
        meta: { page, limit, total, totalPages }
      });
    } catch (error) {
      next(error);
    }
  }
  ,

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const movie = await Movies.findByPk(id);

      if (!movie) {
        return res.status(404).json({
          status: 'error',
          message: 'Movie not found'
        });
      }

      res.json({
        status: 'ok',
        data: movie
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const movieData = req.body;
      const movie = await Movies.create(movieData);


      res.status(201).json({
        status: 'ok',
        data: movie
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const movieData = req.body;

      const movie = await Movies.update(id, movieData);

      res.json({
        status: 'ok',
        data: movie
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      await Movies.remove(id);

      res.json({
        status: 'ok',
        message: 'Movie deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};