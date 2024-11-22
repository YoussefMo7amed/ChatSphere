describe("Application Service", () => {
    it("should create an application", async () => {
        const name = "Test Application";
        const application = await applicationService.createApplication(name);
        expect(application.name).toBe(name);
        expect(application.token).toBeDefined();
    });

    it("should get all applications", async () => {
        const applications = await applicationService.getAllApplications();
        expect(applications.length).toBeGreaterThanOrEqual(1);
    });

    it("should get an application by token", async () => {
        const application = await applicationService.createApplication(
            "Test Application"
        );
        const retrievedApplication =
            await applicationService.getApplicationByToken(application.token);
        expect(retrievedApplication).toEqual(application);
    });

    it("should update an application", async () => {
        const application = await applicationService.createApplication(
            "Test Application"
        );
        const newName = "Updated Test Application";
        const updatedApplication =
            await applicationService.updateApplicationByToken(
                application.token,
                { name: newName }
            );
        expect(updatedApplication.name).toBe(newName);
    });

    it("should delete an application", async () => {
        const application = await applicationService.createApplication(
            "Test Application"
        );
        await applicationService.deleteApplication(application.token);
        const retrievedApplication =
            await applicationService.getApplicationByToken(application.token);
        expect(retrievedApplication).toBeNull();
    });
});
