const request = require("supertest");
const app = require("../../index"); // Adjust to your actual app location

describe("Application API", () => {
    let applicationToken;

    describe("POST /applications", () => {
        it("should create a new application", async () => {
            const response = await request(app)
                .post("/applications")
                .send({ name: "New App" });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token");
            applicationToken = response.body.token;
        });

        it("should throw an error if name is missing", async () => {
            const response = await request(app)
                .post("/applications")
                .send({ name: "" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                "Application name cannot be empty"
            );
        });
    });

    describe("GET /applications", () => {
        it("should retrieve all applications", async () => {
            const response = await request(app).get("/applications");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe("GET /applications/:token", () => {
        it("should retrieve an application by token", async () => {
            const response = await request(app).get(
                `/applications/${applicationToken}`
            );

            expect(response.status).toBe(200);
            expect(response.body.token).toBe(applicationToken);
        });

        it("should return 404 if application is not found", async () => {
            const response = await request(app).get(
                "/applications/invalid-token"
            );

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Application not found");
        });
    });

    describe("PUT /applications/:token", () => {
        it("should update an application's name", async () => {
            const response = await request(app)
                .put(`/applications/${applicationToken}`)
                .send({ name: "Updated App" });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Updated App");
        });
    });

    describe("DELETE /applications/:token", () => {
        it("should delete an application", async () => {
            const response = await request(app).delete(
                `/applications/${applicationToken}`
            );

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(
                "Application deleted successfully"
            );
        });
    });
});
