export const errorResponse = (res, status, code, description) => {
  return res.status(status).json({
    error: {
      code,
      description
    }
  });
};
