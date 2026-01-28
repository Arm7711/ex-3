import jwt from 'jsonwebtoken';
import Users from '../models/users.js';

const { AUTH_SECRET } = process.env;

export default {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      
      if (!user) {
        res.status(422).json({ 
          status: 'error', 
          message: 'email or password are invalid' 
        });
        return;
      }
      
      if (!Users.checkPassword(user.password, password)) {
        res.status(422).json({ 
          status: 'error', 
          message: 'email or password are invalid' 
        });
        return;
      }
      
      const token = jwt.sign(
        { userId: user.id }, 
        AUTH_SECRET, 
        { expiresIn: '1d' }
      );
      
      res.json({ 
        status: 'ok', 
        token, 
        user 
      });
      
    } catch (e) {
      next(e);
    }
  },
  
  async registration(req, res, next) {
    try {
      const { first_name, last_name, email, password, dob } = req.body;
      const user = await Users.create({ 
        first_name, 
        last_name, 
        email, 
        password, 
        dob 
      });
      
      res.json({ 
        status: 'ok', 
        user 
      });
      
    } catch (e) {
      next(e);
    }
  },
  
  async profile(req, res, next) {
    try {
      const user = await Users.findByPk(req.userId);
      res.json({ 
        status: "ok", 
        user 
      });
    } catch (e) {
      next(e);
    }
  },

  async changePassword(req, res, next) {
    try {
      const userId = req.userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(422).json({
          status: 'error',
          message: 'Old password and new password are required'
        });
      }

      const result = await Users.changePassword(userId, oldPassword, newPassword);

      res.json({
        status: 'ok',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
}
};