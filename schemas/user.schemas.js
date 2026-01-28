import Joi from 'joi';

export default {
  registration: {
    body: Joi.object({
      first_name: Joi.string().min(2).max(50).required()
        .messages({
          'string.empty': 'First name is required',
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 50 characters'
        }),
      last_name: Joi.string().min(2).max(50).required()
        .messages({
          'string.empty': 'Last name is required',
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 50 characters'
        }),
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.empty': 'Email is required'
        }),
      password: Joi.string().min(6).required()
        .messages({
          'string.empty': 'Password is required',
          'string.min': 'Password must be at least 6 characters long'
        }),
      dob: Joi.date().iso().max('now').required()
        .messages({
          'date.base': 'Date of birth must be a valid date',
          'date.format': 'Date of birth must be in YYYY-MM-DD format',
          'date.max': 'Date of birth cannot be in the future'
        })
    })
  },
  
  login: {
    body: Joi.object({
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.empty': 'Email is required'
        }),
      password: Joi.string().required()
        .messages({
          'string.empty': 'Password is required'
        })
    })
  },

   changePassword: {
    body: Joi.object({
      oldPassword: Joi.string().min(6).required()
        .messages({
          'string.empty': 'Old Password is required',
          'string.min': 'Password must be at least 6 characters long'
        }),

        newPassword: Joi.string().min(6).required()
        .messages({
          'string.empty': 'New Password is required',
          'string.min': 'Password must be at least 6 characters long'
        }),
    })
  }
};
