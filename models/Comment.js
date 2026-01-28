import _ from "lodash";
import DB from '../clients/db.mysql.js';
import moment from 'moment';

export async function create({ user_id, movie_id, rating, comment_text }) {
  const [bookingCheck] = await DB.query(`
    SELECT COUNT(b.id) AS total
    FROM bookings b
    JOIN showtimes s ON b.showtime_id = s.id
    WHERE b.user_id = ? AND s.movie_id = ? AND b.status = 'confirmed'
  `, [user_id, movie_id]);

  if (bookingCheck[0].total === 0) {
    throw new Error("You cannot comment on a movie you haven't watched");
  }

  const [result] = await DB.query(`
    INSERT INTO comments (user_id, movie_id, rating, comment_text)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      comment_text = VALUES(comment_text), 
      rating = VALUES(rating), 
      updated_at = CURRENT_TIMESTAMP
  `, [user_id, movie_id, rating, comment_text]);

  let commentId;

  if (result.insertId && result.insertId !== 0) {
    commentId = result.insertId; 
  } else {y
    const [rows] = await DB.query(
      `SELECT id FROM comments WHERE user_id = ? AND movie_id = ?`,
      [user_id, movie_id]
    );
    if (!rows || rows.length === 0) throw new Error("Comment insertion failed");
    commentId = rows[0].id;
  }

  const comment = await findByPk(commentId);
  if (!comment) throw new Error("Comment not found after insert");
  
  return comment;
}



export async function findByPk(id) {
    const result = await DB.query(`
    SELECT c.*, u.first_name, u.last_name, m.title AS movie_title
    FROM comments c
    JOIN users u ON c.user_id = u.id
    JOIN movies m ON c.movie_id = m.id
    WHERE c.id = ?
  `, [id]);

    return _.get(result, '0.0', null);
}

export async function update(id, user_id, data) {
    const comment = await findByPk(id);

    if (!comment) throw new Error("Comment not found");
    if (comment.user_id !== user_id) throw new Error("Access denied");

    const created = moment(comment.created_at);
    if (moment().diff(created, 'hours') > 24) {
        throw new Error("Cannot edit comment after 24 hours");
    }

    const fields = [];
    const values = [];

    if (data.comment_text) {
        fields.push('comment_text = ?');
        values.push(data.comment_text);
    }
    if (data.rating) {
        fields.push('rating = ?');
        values.push(data.rating);
    }

    values.push(id);

    await DB.query(`
    UPDATE comments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);

    return await findByPk(id);
}

export async function remove(id, user_id, hardDelete = false) {
    const comment = await findByPk(id);
    if (!comment) throw new Error("Comment not found");
    if (comment.user_id !== user_id && !hardDelete) throw new Error("Access denied");

    if (hardDelete) {
        await DB.query('DELETE FROM comments WHERE id = ?', [id]);
    } else {
        await DB.query('UPDATE comments SET status = "deleted" WHERE id = ?', [id]);
    }

    return true;
}

export async function findByMovie(movie_id, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    let order = 'c.created_at DESC';
    if (options.sort === 'oldest') order = 'c.created_at ASC';
    if (options.sort === 'highest') order = 'c.rating DESC';
    if (options.sort === 'lowest') order = 'c.rating ASC';

    const comments = await DB.query(`
    SELECT c.*, u.first_name, u.last_name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.movie_id = ? AND c.status = 'approved'
    ORDER BY ${order}
    LIMIT ? OFFSET ?
  `, [movie_id, limit, offset]);

    const [countResult] = await DB.query(`
    SELECT COUNT(*) AS total, AVG(rating) AS avg_rating
    FROM comments
    WHERE movie_id = ? AND status = 'approved'
  `, [movie_id]);

    return {
        comments,
        total: countResult[0].total,
        avg_rating: parseFloat(countResult[0].avg_rating || 0)
    };
}

export async function findAllAdmin(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let where = '';
    const values = [];

    if (options.status) {
        where = 'WHERE c.status = ?';
        values.push(options.status);
    }

    const comments = await DB.query(`
    SELECT c.*, u.first_name, u.last_name, m.title AS movie_title
    FROM comments c
    JOIN users u ON c.user_id = u.id
    JOIN movies m ON c.movie_id = m.id
    ${where}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `, [...values, limit, offset]);

    return comments;
}

export async function moderate(id, status) {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        throw new Error("Invalid status");
    }
    await DB.query('UPDATE comments SET status = ? WHERE id = ?', [status, id]);
    return true;
}

export default {
    create,
    findByPk,
    update,
    remove,
    findByMovie,
    findAllAdmin,
    moderate
};
