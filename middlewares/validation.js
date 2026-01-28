import _ from 'lodash';

export default (targets) => {
  return (req, res, next) => {
    const errorDetails = {};

    for (const [property, schema] of Object.entries(targets)) {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        errors: {
          wrap: {
            label: false
          }
        }
      });

      if (!error) {
        req[property] = value;
        continue;
      }

      error.details.map((detail) => {
        _.set(errorDetails, detail.path.join('.'), detail.message);
      })
    }

    if (_.isEmpty(errorDetails)) {
      next();
      return
    }

    res.status(422).json({
      status: 'error',
      message: 'Validation error',
      errors: errorDetails
    });
  };
};