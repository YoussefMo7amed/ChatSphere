const request = require("supertest");
const app = require("../../src/index"); // Adjust the path to your app
const { Application, Chat } = require("../../src/models"); // Adjust the path to your models
const sequelize = require("../../src/database"); // Adjust to your sequelize instance

describe("Chat API", () => {
    let applicationToken;
    let applicationId;

    // Set up an application token before running the tests
    beforeAll(async () => {
        // Create an application (adjust according to how applications are created in your app)
        const application = await Application.create({
            name: "Test Application",
        });
        applicationToken = application.token; // Assuming the Application model has a token field
        applicationId = application.id;
    });

    afterAll(async () => {
        // Clean up after tests
        await sequelize.close();
    });

    describe("POST /applications/:token/chats", () => {
        it("should create a new chat", async () => {
            const response = await request(app)
                .post(`/applications/${applicationToken}/chats`)
                .send({ number: 1 });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body.number).toBe(1);
            expect(response.body.application_id).toBe(applicationId);
        });

        it("should throw an error if chat number is missing", async () => {
            const response = await request(app)
                .post(`/applications/${applicationToken}/chats`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Chat number is required");
        });

        it("should throw an error if chat number is already taken", async () => {
            // Create the first chat with number 1
            await request(app)
                .post(`/applications/${applicationToken}/chats`)
                .send({ number: 1 });

            const response = await request(app)
                .post(`/applications/${applicationToken}/chats`)
                .send({ number: 1 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Chat number already exists");
        });
    });

    describe("GET /applications/:token/chats", () => {
        it("should retrieve all chats for the application", async () => {
            // Create some chats for the application
            await request(app)
                .post(`/applications/${applicationToken}/chats`)
                .send({ number: 2 });
            await request(app)
                .post(`/applications/${applicationToken}/chats`)
                .send({ number: 3 });

            const response = await request(app).get(
                `/applications/${applicationToken}/chats`
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it("should return an empty array if no chats exist", async () => {
            const response = await request(app).get(
                `/applications/${applicationToken}/chats`
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });
});
