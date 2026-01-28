import jwt from "jsonwebtoken";
import HttpErrors from "http-errors";
import Users from '../models/users.js';

const { AUTH_SECRET } = process.env;

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;
    
    if (!authHeader) {
      throw new HttpErrors(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpErrors(401, 'Token missing');
    }

    const payload = jwt.verify(token, AUTH_SECRET);

    const user = await Users.findByPk(payload.userId);

    
    if (!user) {
      throw new HttpErrors(401, 'User not found');
    } 
    req.user = user;
    req.userId = user.id;
    next();

  } catch (err) {
    next(new HttpErrors(401, 'Unauthorized'));
  }
}