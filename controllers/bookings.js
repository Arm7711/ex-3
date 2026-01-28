import moment from 'moment';
import Bookings from '../models/bookings.js';
import Showtimes from '../models/showtimes.js';
import Seats from '../models/seats.js';

export default {
 async create(req, res, next) {
    try {
      const { showtime_id, seat_ids, payment_method } = req.body;
      const userId = req.userId;
      

      if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No seats selected'
        });
      }

      if (seat_ids.length > 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum 6 seats per booking'
        });
      }

      const showtime = await Showtimes.findByPk(showtime_id);
      if (!showtime) {
        return res.status(404).json({ status: 'error', message: 'Showtime not found' });
      }

      const availableSeats = await Seats.findAvailableSeats(showtime_id);
      const availableSeatIds = availableSeats[0].map(s => s.id);

      const unavailable = seat_ids.filter(id => !availableSeatIds.includes(id));
      if (unavailable.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: `Seats already booked: ${unavailable.join(', ')}`
        });
      }

      const now = moment(); 
      const bookings = [];

      for (const seat_id of seat_ids) {
        const booking = await Bookings.create({
          user_id: userId,
          showtime_id,
          seat_id,
          booking_date: now.format('YYYY-MM-DD'),
          booking_time: now.format('HH:mm:ss'),
          total_price: showtime.price,
          payment_method
        });
        bookings.push(booking);
      }

      res.status(201).json({
        status: 'ok',
        data: bookings,
        message: 'Booking created successfully'
      });

    } catch (error) {
      if (error.message === 'Seat already booked') {
        return res.status(400).json({
          status: 'error',
          message: 'One or more seats are already booked'
        });
      }
      next(error);
    }
  },

  async getBookingHistory(req, res, next) {
    try {
      const bookings = await Bookings.findByUser(req.userId);

      const history = bookings.map(booking => {
        const date = moment(`${booking.show_date} ${booking.start_time}`);
        const formattedDate = date.format('DD MMMM YYYY, HH:mm');

        return {
          user: `${req.user.first_name} ${req.user.last_name}`,
          seat: `${booking.seat_number}`,
          movie: booking.movie_title,
          date: formattedDate,
          hall: booking.hall_number
        };
      });

      res.json({
        status: 'ok',
        data: history
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserBookings(req, res, next) {
    try {
      const userId = req.userId;
      const bookings = await Bookings.findByUser(userId);

      res.json({
        status: 'ok',
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const booking = await Bookings.findByPk(id);

      if (!booking) {
        return res.status(404).json({
          status: 'error',
          message: 'Booking not found'
        });
      }

      if (booking.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }

      res.json({
        status: 'ok',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      await Bookings.cancelBooking(id, userId);

      res.json({
        status: 'ok',
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      if (error.message === 'Booking not found or cannot be cancelled') {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  }
};