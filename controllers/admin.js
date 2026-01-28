import DB from '../clients/db.mysql.js';

export default {

  async getDashboard(req, res) {
    try {
      const [stats] = await DB.query(`
        SELECT
          COUNT(DISTINCT user_id) AS active_users,
          COUNT(id) AS total_tickets_sold,
          SUM(total_price) AS total_revenue
        FROM bookings
      `);

      res.json({
        status: 'ok',
        data: stats[0]
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Dashboard error' });
    }
  },

  async getFilmAnalytics(req, res) {
    try {
      const [rows] = await DB.query(`
        SELECT 
          m.id,
          m.title,
          COUNT(b.id) AS total_bookings,
          SUM(b.total_price) AS total_revenue,
          ROUND(COUNT(b.id) / COUNT(DISTINCT s.id), 2) AS avg_seats_per_showtime
        FROM movies m
        JOIN showtimes s ON m.id = s.movie_id
        LEFT JOIN bookings b ON s.id = b.showtime_id
        GROUP BY m.id
        ORDER BY total_bookings DESC
      `);

      res.json({
        status: 'ok',
        data: rows
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Film analytics error' });
    }
  },

  async getRevenueAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const [rows] = await DB.query(`
        SELECT 
          booking_date,
          COUNT(id) AS total_bookings,
          SUM(total_price) AS total_revenue
        FROM bookings
        WHERE booking_date BETWEEN ? AND ?
        GROUP BY booking_date
        ORDER BY booking_date
      `, [startDate, endDate]);

      res.json({
        status: 'ok',
        data: rows
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Revenue analytics error' });
    }
  },

  async getTopUsers(req, res) {
    try {
      const [rows] = await DB.query(`
        SELECT 
          u.id,
          CONCAT(u.first_name,' ',u.last_name) AS username,
          COUNT(b.id) AS total_bookings,
          SUM(b.total_price) AS total_spent
        FROM users u
        JOIN bookings b ON u.id = b.user_id
        GROUP BY u.id
        ORDER BY total_bookings DESC
      `);

      res.json({
        status: 'ok',
        data: rows
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Top users error' });
    }
  },

  async getShowtimeStats(req, res) {
    try {
      const [rows] = await DB.query(`
        SELECT 
          s.id AS showtime_id,
          m.title,
          s.show_date,
          s.start_time,
          COUNT(b.id) AS seats_booked,
          s.total_seats,
          ROUND((COUNT(b.id) / s.total_seats) * 100, 2) AS occupancy_percentage,
          SUM(b.total_price) AS revenue
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.id
        LEFT JOIN bookings b ON s.id = b.showtime_id
        GROUP BY s.id
        ORDER BY occupancy_percentage DESC
      `);

      res.json({
        status: 'ok',
        data: rows
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Showtime stats error' });
    }
  }

};
