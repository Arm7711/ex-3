import _ from "lodash";
import md5 from "md5";
import HttpErrors from "http-errors";
import DB from '../clients/db.mysql.js';

const { USER_SECRET } = process.env;

export async function findByPk(id) {
  const result = await DB.query('SELECT * FROM users WHERE id = ?', [id]);
  return _.get(result, '0.0', null);
}

export async function findOne(where) {
  if (_.isEmpty(where)) {
    return null;
  }
  
  const fields = Object.keys(where);
  const values = Object.values(where);
  const whereFields = fields.map(field => `${field} = ?`).join(' AND ');
  const query = `SELECT * FROM users WHERE ${whereFields}`;
  
  const result = await DB.query(query, values);
  return _.get(result, '0.0', null);
}

export async function create({ first_name, last_name, email, password, dob }) {
  if (await findOne({ email })) {
    throw HttpErrors(422, "User already exists!");
  }
  
  const passwordMD5 = md5(md5(password) + USER_SECRET);
  const query = `
    INSERT INTO users 
    (first_name, last_name, email, password, dob) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  await DB.query(query, [first_name, last_name, email, passwordMD5, dob]);
  return await findOne({ email });
}

export function checkPassword(password, password2) {
  return password === md5(md5(password2) + USER_SECRET);
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await findByPk(userId);
  if (!user) {
    throw HttpErrors(404, "User not found");
  }

  if (!checkPassword(user.password, oldPassword)) {
    throw HttpErrors(400, "Old password is incorrect");
  }

  const newPasswordMD5 = md5(md5(newPassword) + USER_SECRET);
  await DB.query('UPDATE users SET password = ? WHERE id = ?', [newPasswordMD5, userId]);

  return { message: "Password changed successfully" };
}


export default {
  findByPk,
  findOne,
  create,
  checkPassword,
  changePassword
};