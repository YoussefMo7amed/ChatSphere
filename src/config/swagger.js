const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "API documentation for the project",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        components: {
            parameters: {
                TokenParameter: {
                    in: "path",
                    name: "token",
                    required: true,
                    description: "The token of the application",
                    schema: {
                        type: "string",
                    },
                },
            },
        },
    },
    apis: ["./app/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
