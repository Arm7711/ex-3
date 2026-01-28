import _ from "lodash";
import DB from '../clients/db.mysql.js';

export async function findByPk(id) {
    const result = await DB.query('SELECT * FROM seats WHERE id = ?', [id]);
    return _.get(result, '0.0', null);
}

export async function findByShowtime(showtimeId) {
    const result = await DB.query(`
    SELECT s.*, 
        CASE 
            WHEN b.id IS NOT NULL THEN false 
            ELSE s.is_available 
        END as is_available_now
    FROM seats s
    LEFT JOIN bookings b ON s.id = b.seat_id AND b.showtime_id = ? AND b.status != 'cancelled'
    WHERE s.showtime_id = ? 
    ORDER BY s.seat_row, s.seat_number
  `, [showtimeId, showtimeId]);

    return result;
}

export async function findAvailableSeats(showtimeId) {
    const result = await DB.query(`
    SELECT s.*
    FROM seats s
    LEFT JOIN bookings b ON s.id = b.seat_id AND b.showtime_id = ? AND b.status != 'cancelled'
    WHERE s.showtime_id = ? 
    AND s.is_available = true 
    AND b.id IS NULL
  `, [showtimeId, showtimeId]);

    return result;
}

export async function createSeatsForShowtime(showtimeId, rows, seatsPerRow) {
    const seats = [];

    for (let row = 1; row <= rows; row++) {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            const seatType = row <= 2 ? 'vip' : (row <= 4 ? 'premium' : 'standard');
            seats.push([showtimeId, `R${row}S${seatNum}`, row, seatType]);
        }
    }

    if (seats.length > 0) {
        await DB.query(`
      INSERT INTO seats (showtime_id, seat_number, seat_row, seat_type) 
      VALUES ?
    `, [seats]);
    }

    return seats.length;
}

export async function updateAvailability(seatId, isAvailable) {
    await DB.query('UPDATE seats SET is_available = ? WHERE id = ?', [isAvailable, seatId]);
    return await findByPk(seatId);
}

export default {
    findByPk,
    findByShowtime,
    findAvailableSeats,
    createSeatsForShowtime,
    updateAvailability
};