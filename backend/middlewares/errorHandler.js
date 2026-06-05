const { UniqueConstraintError, ValidationError } = require('sequelize');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, _next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  if (err instanceof ValidationError) {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Conflit : cette ressource existe déjà' });
  }

  console.error('ERREUR NON GÉRÉE:', err);
  res.status(500).json({
    message: 'Erreur interne du serveur'
  });
};

module.exports = { AppError, errorHandler };
