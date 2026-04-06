const errorHandler = (err, req, res, next) => {
  //NOTE: This means if the error status is not given use 500
  const statusCode = err.statusCode || 500;

  if (err.isOperational) {
    return res.status(statusCode).json({ error: err.message });
  }

  console.log(err);

  return res.status(500).json({ error: 'Something went wrong!' });
};

export default errorHandler;
