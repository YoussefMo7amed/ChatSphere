/**
 * Standard success response
 * @param {Response} res - Express response object
 * @param {Object|Array} data - The data to send in the response
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
function successResponse(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
    });
}
        
/**
 * Standard error response
 * @param {Response} res - Express response object
 * @param {String} message - Error message to send
 * @param {Number} statusCode - HTTP status code (default: 500)
 */
function errorResponse(res, message, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        error: message,
    });
}

module.exports = {
    successResponse,
    errorResponse,
};
