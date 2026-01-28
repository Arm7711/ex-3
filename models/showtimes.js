import _ from "lodash";
import DB from '../clients/db.mysql.js';

export async function findByPk(id) {
  const result = await DB.query(`
    SELECT s.*, m.title as movie_title, m.duration_minutes 
    FROM showtimes s
    LEFT JOIN movies m ON s.movie_id = m.id
    WHERE s.id = ?
  `, [id]);
  return _.get(result, '0.0', null);
}

export async function findAll(where = {}, options = {}) {
  let query = `
    SELECT s.*, m.title as movie_title, m.poster_url, m.duration_minutes
    FROM showtimes s
    LEFT JOIN movies m ON s.movie_id = m.id
    WHERE s.is_active = true
  `;
  
  const values = [];
  
  if (!_.isEmpty(where)) {
    Object.keys(where).forEach((key, index) => {
      if (index === 0) {
        query += ' AND ';
      } else {
        query += ' AND ';
      }
      query += `${key} = ?`;
      values.push(where[key]);
    });
  }
  
  if (options.showDate) {
    query += ' AND s.show_date >= ?';
    values.push(options.showDate);
  }
  
  if (options.orderBy) {
    query += ` ORDER BY s.${options.orderBy} ${options.orderDirection || 'ASC'}`;
  } else {
    query += ' ORDER BY s.show_date, s.start_time';
  }
  
  const result = await DB.query(query, values);
  return result;
}

export async function create(showtimeData) {
  const {
    movie_id,
    show_date,
    start_time,
    end_time,
    hall_number,
    price,
    total_seats
  } = showtimeData;
  
  const query = `
    INSERT INTO showtimes 
    (movie_id, show_date, start_time, end_time, hall_number, price, available_seats, total_seats) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const result = await DB.query(query, [
    movie_id, show_date, start_time, end_time, hall_number, price, total_seats, total_seats
  ]);
  
  return await findByPk(result[0].insertId);
}

export async function updateAvailableSeats(showtimeId, change) {
  await DB.query(`
    UPDATE showtimes 
    SET available_seats = available_seats + ? 
    WHERE id = ? AND available_seats + ? >= 0
  `, [change, showtimeId, change]);
  
  return await findByPk(showtimeId);
}

export default {
  findByPk,
  findAll,
  create,
  updateAvailableSeats
};