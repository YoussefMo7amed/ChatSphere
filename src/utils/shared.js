/**
 * Retrieves the environment and returns whether it is production or not.
 * @returns {boolean} - Whether the environment is production or not.
 */
function isProduction() {
    return String(process.env.NODE_ENV).toLowerCase() !== "development";
}

/**
 * Builds a pagination object from filterParams and a totalItems count.
 *
 * @param {Object} filterParams - Object with the following properties:
 *   - {number} page - The page number to retrieve.
 *   - {number} limit - The number of items to retrieve per page.
 * @param {number} [totalItems=0] - The total number of items available.
 * @returns {Object} - An object with the pagination details:
 *   - {number} page - The current page number.
 *   - {number} limit - The number of items per page.
 *   - {number} totalItems - The total number of items.
 *   - {number} totalPages - The total number of pages.
 *   - {boolean} hasNext - Whether there is a next page.
 *   - {boolean} hasPrev - Whether there is a previous page.
 */
function paginationBuilder(filterParams, totalItems = 0) {
    const { page = 1, limit = 10 } = filterParams;

    // Ensure limit is between 1 and 50
    const limitNumber = Math.max(1, Math.min(parseInt(limit), 50));
    const pageNumber = Math.max(parseInt(page), 1);

    const totalPages = Math.ceil(totalItems / limitNumber);

    return {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
    };
}

/**
 * Builds an order array from the sortBy field, ensuring valid sorting fields.
 *
 * @param {string} sortBy - The sorting field(s), comma-separated (e.g., "name,-createdAt").
 * @param {Array} allowedSortingFields - List of allowed sorting fields.
 * @returns {Array} - Array of tuples [field, direction].
 */
function buildOrder(sortBy, allowedSortingFields = []) {
    let order = [];

    if (sortBy) {
        const sortFields = sortBy.split(",");
        sortFields.forEach((field) => {
            let direction = "ASC";

            // Handle descending order by checking for '-' at the start of the field
            if (field.startsWith("-")) {
                direction = "DESC";
                field = field.substring(1); // Remove the leading '-'
            }

            // Validate if the field is in the allowed sorting fields list
            if (allowedSortingFields.includes(field)) {
                order.push([field, direction]);
            } else {
                console.warn(`Invalid sort field: ${field}`);
            }
        });
    }

    return order;
}

/**
 * Transforms filterParams into SQL query parameters.
 *
 * @param {Object} filterParams - Object containing filtering, pagination, and sorting information.
 * @param {Array} allowedSortingFields - List of allowed sorting fields.
 * @returns {Object} - Transformed query parameters including limit, offset, and order.
 */
function filterParamsToSQL(filterParams, allowedSortingFields = []) {
    const {
        page: pageNumber,
        limit: limitNumber,
        sortBy,
        ...rest
    } = filterParams;

    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 50;
    const MIN_PAGE = 1;

    // Parse and bound page number
    const page = Math.max(parseInt(pageNumber) || DEFAULT_PAGE, MIN_PAGE);

    // Parse and bound limit number
    const limit = Math.min(
        Math.max(parseInt(limitNumber) || DEFAULT_LIMIT, 1),
        MAX_LIMIT
    );

    // Calculate start index
    const offset = (page - 1) * limit;

    // Build the order array with allowed sorting fields
    const order = buildOrder(sortBy, allowedSortingFields);

    return {
        limit,
        offset,
        order,
        ...rest,
    };
}

/**
 * Custom error class to represent "Not Found" errors.
 */
class NotFoundError extends Error {
    /**
     * Constructs a new NotFoundError instance.
     * @param {string} message - The error message.
     * @param {Object} [meta={}] - Additional metadata to provide context for the error.
     */
    constructor(message, meta = {}) {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
        this.meta = meta;
    }

    /**
     * Converts the error object to a plain JSON object.
     * @return {Object} - The error as a JSON object.
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            meta: this.meta,
        };
    }
}

/**
 * Executes a transaction operation, ensuring the transaction is committed or rolled back.
 *
 * @param {Function} operation - A function containing the logic to perform within the transaction.
 * @returns {Promise} - The result of the operation, if successful.
 */
async function performTransaction(operation) {
    const transaction = await sequelize.transaction();

    try {
        const result = await operation(transaction);
        await transaction.commit();
        return result;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    isProduction,
    paginationBuilder,
    filterParamsToSQL,
    NotFoundError, // Exports class
    performTransaction,
};
