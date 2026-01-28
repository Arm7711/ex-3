import express from 'express';
import UsersController from '../controllers/users.js';
import userValidation from '../schemas/user.schemas.js';
import validate from '../middlewares/validation.js';

import authMiddleware from '../middlewares/authorize.js';

const router = express.Router();

router.post(
  '/register',
  validate({ body: userValidation.registration.body }),
  UsersController.registration
);

router.post(
  '/login',
  validate({ body: userValidation.login.body }),
  UsersController.login
);

router.put('/change-password', authMiddleware,validate({ body: userValidation.changePassword.body }), UsersController.changePassword);

export default router;