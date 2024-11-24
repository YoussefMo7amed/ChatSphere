const { Application } = require("../../app/models"); // Adjust path as necessary

describe("applicationRepository", () => {
    describe("create", () => {
        it("should create a new application", async () => {
            const applicationData = { name: "Test App" };
            const application = await Application.create(applicationData);

            expect(application).toHaveProperty("id");
            expect(application.name).toBe(applicationData.name);
        });
    });

    describe("getAll", () => {
        it("should retrieve all applications", async () => {
            await Application.create({ name: "Test App 1" });
            await Application.create({ name: "Test App 2" });

            const applications = await Application.findAll();

            expect(applications.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("getByToken", () => {
        it("should retrieve an application by token", async () => {
            const application = await Application.create({
                name: "Test App",
                token: "test-token",
            });
            const fetchedApplication = await Application.findOne({
                where: { token: application.token },
            });

            expect(fetchedApplication.token).toBe(application.token);
        });
    });

    describe("update", () => {
        it("should update an application's details", async () => {
            const application = await Application.create({
                name: "Old App",
                token: "test-token",
            });
            const updatedApp = await application.update({
                name: "Updated App",
            });

            expect(updatedApp.name).toBe("Updated App");
        });
    });

    describe("delete", () => {
        it("should delete an application", async () => {
            const application = await Application.create({
                name: "Test App",
                token: "delete-token",
            });
            await application.destroy();

            const deletedApplication = await Application.findOne({
                where: { token: "delete-token" },
            });

            expect(deletedApplication).toBeNull();
        });
    });
});
