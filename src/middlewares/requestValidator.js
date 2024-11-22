const applicationRepository = require("../repositories/applicationRepository");

async function validateToken(req, res, next) {
    try {
        const { token } = req.params;
        const application = await applicationRepository.findByToken(token);

        if (!application) {
            return res
                .status(404)
                .json({ success: false, error: "Application not found" });
        }

        // Attach the application to the request object for downstream use
        req.application = application;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validateToken;
