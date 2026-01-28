import Joi from 'joi';

export default {
  create: {
    body: Joi.object({
      title: Joi.string().min(1).max(255).required()
        .messages({
          'string.empty': 'Movie title is required',
          'string.max': 'Title cannot exceed 255 characters'
        }),
      description: Joi.string().allow('').max(2000).optional(),
      duration_minutes: Joi.number().integer().min(1).max(500).required()
        .messages({
          'number.base': 'Duration must be a number',
          'number.min': 'Duration must be at least 1 minute',
          'number.max': 'Duration cannot exceed 500 minutes'
        }),
      genre: Joi.string().max(100).optional(),
      release_year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 5).optional(),
      poster_url: Joi.string().uri().optional()
        .messages({
          'string.uri': 'Poster URL must be a valid URL'
        })
    })
  },
  
  update: {
    body: Joi.object({
      title: Joi.string().min(1).max(255).optional(),
      description: Joi.string().allow('').max(2000).optional(),
      duration_minutes: Joi.number().min(1).max(500).optional(),
      genre: Joi.string().max(100).optional(),
      release_year: Joi.number().min(1900).max(new Date().getFullYear() + 5).optional(),
      poster_url: Joi.string().uri().optional(),
      is_active: Joi.boolean().optional()
    })
  }
};