const errorMiddleware = (err, req, res, next) => {
    const statusCode = res.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ message });
  };
  
  module.exports = errorMiddleware;