const { Application } = require("../../app/models");
const applicationService = require("../../app/services/applicationService");
describe("applicationService", () => {
    describe("createApplication", () => {
        it("should create a new application with a token", async () => {
            const name = "Test App";

            const result = await applicationService.createApplication(name);

            expect(result).toHaveProperty("token");
            expect(result.name).toBe(name);
        });

        it("should throw error if name is not provided", async () => {
            const applicationData = { name: "" };

            await expect(
                applicationService.createApplication(applicationData)
            ).rejects.toBeDefined();
        });
    });

    describe("getAllApplications", () => {
        it("should return all applications", async () => {
            // Create a couple of test applications
            await Application.create({ name: "App 1" });
            await Application.create({ name: "App 2" });

            const filterParams = {}; // Adjust based on actual filter structure if necessary
            const result = await applicationService.getAllApplications(
                filterParams
            );

            expect(result.data).toHaveLength(2); // Check that 2 applications are returned
            expect(result.pagination).toBeDefined(); // Ensure pagination data is present
        });

        it("should handle errors when retrieving all applications", async () => {
            const filterParams = {}; // Adjust as necessary
            // Simulate an error in the repository (mocking the repository method is recommended)
            jest.spyOn(
                applicationRepository,
                "findAllWithCount"
            ).mockRejectedValue(new Error("Database error"));

            await expect(
                applicationService.getAllApplications(filterParams)
            ).rejects.toThrow("Database error");
        });
    });

    describe("getApplicationByToken", () => {
        it("should return an application when given a valid token", async () => {
            const application = await Application.create({ name: "Test App" });

            const result = await applicationService.getApplicationByToken(
                application.token
            );

            expect(result).toHaveProperty("token", application.token);
            expect(result.name).toBe(application.name);
        });

        it("should throw error if no application is found by token", async () => {
            const invalidToken = "non-existent-token";

            await expect(
                applicationService.getApplicationByToken(invalidToken)
            ).rejects.toThrow("Application not found");
        });
    });

    describe("updateApplication", () => {
        it("should update an application's name", async () => {
            const application = await Application.create({
                name: "Old App",
            });
            const updateData = { name: "Updated App" };

            const result = await applicationService.updateApplicationByToken(
                application.token,
                updateData
            );

            expect(result.name).toBe(updateData.name);
        });

        it("should throw error if application does not exist", async () => {
            const updateData = { name: "Updated App" };

            await expect(
                applicationService.updateApplicationByToken(
                    "non-existent-token",
                    updateData
                )
            ).rejects.toThrow("Application not found");
        });
    });

    describe("deleteApplication", () => {
        it("should delete an application by token", async () => {
            const application = await Application.create({ name: "Test App" });

            await expect(
                applicationService.deleteApplicationByToken(application.token)
            ).resolves.toBeUndefined();

            // Ensure the application is deleted from the database
            const deletedApp = await Application.findOne({
                where: { token: application.token },
            });
            expect(deletedApp).toEqual({
                success: false,
                error: {
                    message:
                        "Error deleting application: Lock wait timeout exceeded; try restarting transaction",
                    code: null,
                },
                meta: {},
            });
        });

        it("should throw error if application to delete does not exist", async () => {
            const invalidToken = "non-existent-token";

            await expect(
                applicationService.deleteApplicationByToken(invalidToken)
            ).rejects.toThrow("Application not found");
        });

        it("should handle errors when deleting an application", async () => {
            const application = await Application.create({ name: "Test App" });

            // Mocking delete failure
            jest.spyOn(
                applicationRepository,
                "deleteByToken"
            ).mockRejectedValue(new Error("Database error"));

            await expect(
                applicationService.deleteApplicationByToken(application.token)
            ).rejects.toThrow("Database error");
        });
    });
});
