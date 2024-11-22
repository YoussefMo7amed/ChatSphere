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
     * List all applications
     * @param {Request} req
     * @param {Response} res
     */
    async getAll(req, res) {
        try {
            const applications = await applicationService.getAllApplications();
            successResponse(res, applications, 200);
        } catch (error) {
            errorResponse(res, error.message, 400);
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
            if (!application) {
                errorResponse(res, "Application not found", 404);
                return;
            }
            successResponse(res, application, 200);
        } catch (error) {
            errorResponse(res, error.message, 400);
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
            errorResponse(res, error.message, 400);
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
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new ApplicationController();
