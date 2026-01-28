import Joi from 'joi';

export default {
  create: {
    body: Joi.object({
      showtime_id: Joi.number().integer().min(1).required()
        .messages({
          'number.base': 'Showtime ID must be a number',
          'number.min': 'Invalid showtime ID'
        }),
      seat_ids: Joi.required()
        .messages({
          'number.required': 'Seat ID required',
        }),
      payment_method: Joi.string().valid('card', 'cash', 'online').default('card')
        .messages({
          'any.only': 'Payment method must be one of: card, cash, online'
        })
    })
  }
};