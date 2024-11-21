/**
 * Retrieves the environment and return if it production or not.
 * @returns {boolean} - Is production or not.
 */
function isProduction() {
    return String(process.env.NODE_ENV).toLowerCase() !== "development";
}
/**
 * Constructs a FHIR-compliant pagination object based on filter parameters and total item count.
 *
 * @param {Object} filterParams - The filter parameters from the request.
 * @param {number} filterParams._count - The number of items per page.
 * @param {number} filterParams._skip - The number of items to skip (starting index).
 * @param {number} [totalItems=0] - The total number of items available (default is 0).
 * @param {string} baseUrl - The base URL of the current request (e.g., '/fhir/Patient').
 * @returns {Object} - An object containing pagination details and FHIR-compatible links:
 *                     - {number} limitNumber - The number of items per page (bounded by _count).
 *                     - {number} startIndex - The starting index (_skip).
 *                     - {number} totalPages - The total number of pages.
 *                     - {number} totalItems - The total number of items.
 *                     - {string|null} self - The current page URL.
 *                     - {string|null} next - The next page URL.
 *                     - {string|null} previous - The previous page URL.
 */
function paginationBuilder(filterParams, totalItems = 0, baseUrl) {
    const { count, skip } = filterParams;

    // Default and bounded values for _count (number of items per page)
    const DEFAULT_COUNT = 10;
    const MAX_COUNT = 50;
    const limitNumber = Math.min(
        Math.max(parseInt(count) || DEFAULT_COUNT, 1),
        MAX_COUNT
    );

    // Default value and bound for _skip (starting index)
    const startIndex = Math.max(parseInt(skip) || 0, 0);

    // Calculate total pages and current page number
    const totalPages = Math.ceil(totalItems / limitNumber);
    const currentPage = Math.floor(startIndex / limitNumber) + 1;

    // Calculate the next and previous starting indexes
    const nextStartIndex =
        startIndex + limitNumber < totalItems ? startIndex + limitNumber : null;
    const prevStartIndex =
        startIndex - limitNumber >= 0 ? startIndex - limitNumber : null;

    // Construct the current, next, and previous URLs
    const self = `${baseUrl}?_skip=${startIndex}&_count=${limitNumber}`;
    const next =
        nextStartIndex !== null
            ? `${baseUrl}?_skip=${nextStartIndex}&_count=${limitNumber}`
            : null;
    const previous =
        prevStartIndex !== null
            ? `${baseUrl}?_skip=${prevStartIndex}&_count=${limitNumber}`
            : null;

    return {
        limitNumber,
        startIndex,
        totalPages,
        totalItems,
        links: {
            self,
            next,
            previous,
        },
    };
}

module.exports = {
    isProduction,
    paginationBuilder,
};
