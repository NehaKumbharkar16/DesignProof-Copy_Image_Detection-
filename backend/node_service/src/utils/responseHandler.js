export const successResponse = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};

export const errorResponse = (res, message, error = null, statusCode = 500) => {
    return res.status(statusCode).json({
        status: 'error',
        message,
        error: error ? error.toString() : null,
    });
};
