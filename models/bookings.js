import _ from "lodash";
import DB from '../clients/db.mysql.js';

export async function findByPk(id) {
    const [result] = await DB.query(`
        SELECT b.*, 
               u.first_name, u.last_name, u.email,
               m.title as movie_title,
               s.show_date, s.start_time,
               st.seat_number, st.seat_row, st.seat_type
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN showtimes s ON b.showtime_id = s.id
        LEFT JOIN movies m ON s.movie_id = m.id
        LEFT JOIN seats st ON b.seat_id = st.id
        WHERE b.id = ?
    `, [id]);

    return _.get(result, '0', null);
}

export async function findByUser(userId) {
    const [result] = await DB.query(`
        SELECT b.*, 
               m.title as movie_title,
               m.poster_url,
               s.show_date, s.start_time, s.hall_number,
               st.seat_number, st.seat_row, st.seat_type
        FROM bookings b
        LEFT JOIN showtimes s ON b.showtime_id = s.id
        LEFT JOIN movies m ON s.movie_id = m.id
        LEFT JOIN seats st ON b.seat_id = st.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    `, [userId]);

    return result;
}

export async function create(bookingData) {
    const {
        user_id,
        showtime_id,
        seat_id,
        booking_date,
        booking_time,
        total_price,
        payment_method = 'card'
    } = bookingData;

    const [existingBooking] = await DB.query(`
        SELECT id FROM bookings 
        WHERE showtime_id = ? AND seat_id = ? AND status != 'cancelled'
    `, [showtime_id, seat_id]);

    if (existingBooking.length > 0) {
        throw new Error('Seat already booked');
    }

    const [result] = await DB.query(`
        INSERT INTO bookings 
        (user_id, showtime_id, seat_id, booking_date, booking_time, total_price, payment_method) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [user_id, showtime_id, seat_id, booking_date, booking_time, total_price, payment_method]);

    await DB.query(`
        UPDATE showtimes 
        SET available_seats = available_seats - 1 
        WHERE id = ? AND available_seats > 0
    `, [showtime_id]);

    return await findByPk(result.insertId);
}

export async function cancelBooking(bookingId, userId) {
    const [booking] = await DB.query(`
        SELECT showtime_id FROM bookings 
        WHERE id = ? AND user_id = ? AND status = 'confirmed'
    `, [bookingId, userId]);

    if (booking.length === 0) {
        throw new Error('Booking not found or cannot be cancelled');
    }

    await DB.query(`
        UPDATE bookings 
        SET status = 'cancelled', payment_status = 'refunded' 
        WHERE id = ? AND user_id = ?
    `, [bookingId, userId]);

    await DB.query(`
        UPDATE showtimes 
        SET available_seats = available_seats + 1 
        WHERE id = ?
    `, [booking[0].showtime_id]);

    return true;
}

export default {
    findByPk,
    findByUser,
    create,
    cancelBooking
};
