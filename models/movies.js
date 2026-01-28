import _ from "lodash";
import DB from '../clients/db.mysql.js';

const allowedColumns = ['id', 'title', 'genre', 'release_year', 'is_active'];

export async function findByPk(id) {
  const result = await DB.query('SELECT * FROM movies WHERE id = ?', [id]);
  return _.get(result, '0.0', null);
}

export async function findAll(where = {}, options = {}) {
  let query = 'SELECT * FROM movies';
  const values = [];
  const whereFields = [];

  if (!_.isEmpty(where)) {
    Object.keys(where).forEach(k => {
      if (allowedColumns.includes(k)) {
        whereFields.push(`${k} = ?`);
        values.push(where[k]);
      }
    });
  }

  if (options.search) {
    whereFields.push('title LIKE ?');
    values.push(`%${options.search}%`);
  }

  if (options.duration) {
    if (options.duration === 'short') whereFields.push('duration_minutes <= 90');
    else if (options.duration === 'medium') whereFields.push('duration_minutes BETWEEN 91 AND 150');
    else if (options.duration === 'long') whereFields.push('duration_minutes > 150');
  }

  if (whereFields.length > 0) query += ` WHERE ${whereFields.join(' AND ')}`;

  if (options.orderBy) query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;

  if (options.limit) query += ' LIMIT ?';
  if (options.offset) query += ' OFFSET ?';
  if (options.limit) values.push(options.limit);
  if (options.offset) values.push(options.offset);

  const [result] = await DB.query(query, values);
  return result;
}

export async function count(where = {}, options = {}) {
  let query = 'SELECT COUNT(*) AS total FROM movies';
  const values = [];
  const whereFields = [];

  if (!_.isEmpty(where)) {
    Object.keys(where).forEach(k => {
      if (allowedColumns.includes(k)) {
        whereFields.push(`${k} = ?`);
        values.push(where[k]);
      }
    });
  }

  if (options.search) {
    whereFields.push('title LIKE ?');
    values.push(`%${options.search}%`);
  }

  if (options.duration) {
    if (options.duration === 'short') whereFields.push('duration_minutes <= 90');
    else if (options.duration === 'medium') whereFields.push('duration_minutes BETWEEN 91 AND 150');
    else if (options.duration === 'long') whereFields.push('duration_minutes > 150');
  }

  if (whereFields.length > 0) query += ` WHERE ${whereFields.join(' AND ')}`;

  const [result] = await DB.query(query, values);
  return result[0] || { total: 0 };
}

export async function create(movieData) {
  const {
    title,
    description,
    duration_minutes,
    genre,
    release_year,
    poster_url
  } = movieData;

  const query = `
    INSERT INTO movies     
    (title, description, duration_minutes, genre, release_year, poster_url) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await DB.query(query, [
    title, description, duration_minutes, genre, release_year, poster_url
  ]);

  return await findByPk(result[0].insertId);
}

export async function update(id, movieData) {
  const fields = [];
  const values = [];

  Object.keys(movieData).forEach(key => {
    fields.push(`${key} = ?`);
    values.push(movieData[key]);
  });

  values.push(id);

  const query = `
    UPDATE movies 
    SET ${fields.join(', ')} 
    WHERE id = ?
  `;

  await DB.query(query, values);
  return await findByPk(id);
}

export async function remove(id) {
  const [rows] = await DB.query(
    `SELECT COUNT(*) AS total 
     FROM bookings b 
     JOIN showtimes s ON b.showtime_id = s.id 
     WHERE s.movie_id = ?`,
    [id]
  );

  if (rows[0].total > 0) {
    throw new Error('Cannot delete movie with existing bookings');
  }


  await DB.query('DELETE FROM movies WHERE id = ?', [id]);
  return true;
}


export default {
  findAll,
  findByPk,
  create,
  update,
  remove,
  count
};