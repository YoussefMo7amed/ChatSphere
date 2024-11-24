/**
 * Standard success response
 * @param {Response} res - Express response object
 * @param {*} data - Data to be sent in response
 * @param {number} [statusCode=200] - HTTP status code
 * @param {Object} [meta={}] - Additional metadata to be sent in response
 * @returns {Response} - Express response object
 */
function successResponse(res, data, statusCode = 200, meta) {
    return res.status(statusCode).json({
        success: true,
        data,
        meta,
    });
}

/**
 * Standard error response
 * @param {Response} res - Express response object
 * @param {String} message - Error message to send
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {String} [errorCode] - Optional error code for client-side handling
 * @param {Object} [meta] - Optional additional metadata
 */
function errorResponse(
    res,
    message,
    statusCode = 500,
    errorCode = null,
    meta = {}
) {
    return res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: errorCode,
        },
        meta,
    });
}

module.exports = {
    successResponse,
    errorResponse,
};
