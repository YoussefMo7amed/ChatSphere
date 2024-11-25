const applicationService = require("../services/applicationService");
const {
    successResponse,
    errorResponse,
} = require("../../utils/responseHelper");

class ApplicationController {
    /**
     * Create a new application
     * @param {Request} req
     * @param {Response} res
     */
    async create(req, res) {
        try {
            const { name } = req.body;
            const application = await applicationService.createApplication(
                name
            );
            successResponse(res, application, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    /**
     * Retrieves all applications.
     * @param {Request} req
     * @param {Response} res
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const { data, ...meta } =
                await applicationService.getAllApplications({ page, limit });
            successResponse(res, data, 200, meta);
        } catch (error) {
            errorResponse(res, error.message, 500);
        }
    }

    /**
     * Get an application by token
     * @param {Request} req
     * @param {Response} res
     */
    async getOne(req, res) {
        try {
            const { token } = req.params; // Application token
            const application = await applicationService.getApplicationByToken(
                token
            );
            successResponse(res, application, 200);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    /**
     * Update an application
     * @param {Request} req
     * @param {Response} res
     */
    async update(req, res) {
        try {
            const { token } = req.params; // Application token
            const { name } = req.body;
            const application =
                await applicationService.updateApplicationByToken(token, {
                    name,
                });
            if (!application) {
                errorResponse(res, "Application not found", 404);
                return;
            }
            successResponse(res, application, 200);
        } catch (error) {
            errorResponse(res, error.message, 500);
        }
    }

    /**
     * Delete an application
     * @param {Request} req
     * @param {Response} res
     */
    async delete(req, res) {
        try {
            const { token } = req.params; // Application token
            await applicationService.deleteApplicationByToken(token);
            successResponse(res, "Application deleted", 200);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }
}

module.exports = new ApplicationController();
