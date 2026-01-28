import moment from 'moment';
import Showtimes from '../models/showtimes.js';
import Seats from '../models/seats.js';

export default {
  async getAll(req, res, next) {
    try {
      const { movie_id, date } = req.query;
      const where = {};

      if (movie_id) where.movie_id = movie_id;

      const showtimes = await Showtimes.findAll(where, {
        showDate: date || moment().format('YYYY-MM-DD'),
        orderBy: 'show_date',
        orderDirection: 'ASC'
      });

      res.json({
        status: 'ok',
        data: showtimes
      });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const showtime = await Showtimes.findByPk(id);

      if (!showtime) {
        return res.status(404).json({
          status: 'error',
          message: 'Showtime not found'
        });
      }

      const seats = await Seats.findByShowtime(id);

      res.json({
        status: 'ok',
        data: {
          ...showtime,
          seats
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const showtimeData = req.body;

      const showtime = await Showtimes.create(showtimeData);

      const rows = showtimeData.rows || 5;
      const seatsPerRow = showtimeData.seats_per_row || 5;

      await Seats.createSeatsForShowtime(showtime.id, rows, seatsPerRow);

      res.status(201).json({
        status: 'ok',
        data: showtime
      });
    } catch (error) {
      next(error);
    }
  },

  async getAvailableSeats(req, res, next) {
    try {
      const { id } = req.params;
      const seats = await Seats.findAvailableSeats(id);

      res.json({
        status: 'ok',
        data: seats
      });
    } catch (error) {
      next(error);
    }
  }
};