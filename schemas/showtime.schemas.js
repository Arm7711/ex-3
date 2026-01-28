import Joi from 'joi';

export default {
  create: {
    body: Joi.object({
      movie_id: Joi.number().min(1).required()
        .messages({
          'number.base': 'Movie ID must be a number',
          'number.min': 'Invalid movie ID'
        }),
      show_date: Joi.date().iso().min('now').required()
        .messages({
          'date.base': 'Show date must be a valid date',
          'date.format': 'Show date must be in YYYY-MM-DD format',
          'date.min': 'Show date cannot be in the past'
        }),
      start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        .messages({
          'string.pattern.base': 'Start time must be in HH:MM format'
        }),
      end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        .messages({
          'string.pattern.base': 'End time must be in HH:MM format'
        }),
      hall_number: Joi.number().min(1).max(10).required()
        .messages({
          'number.base': 'Hall number must be a number',
          'number.min': 'Hall number must be at least 1',
          'number.max': 'Hall number cannot exceed 10'
        }),
      price: Joi.number().min(0).max(1000).required()
        .messages({
          'number.base': 'Price must be a number',
          'number.min': 'Price cannot be negative',
          'number.max': 'Price cannot exceed 1000'
        }),
      total_seats: Joi.number().integer().min(1).max(200).required()
        .messages({
          'number.base': 'Total seats must be a number',
          'number.min': 'There must be at least 1 seat',
          'number.max': 'Cannot have more than 200 seats'
        }),
      rows: Joi.number().integer().min(1).max(5).optional().default(5),
      seats_per_row: Joi.number().integer().min(1).max(5).optional().default(5)
    })
  }
};