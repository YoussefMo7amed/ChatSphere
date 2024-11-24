// src/index.js
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const api = require("./app/routes/index");
require("dotenv").config();
const bodyParser = require("body-parser");
const { connectToRedis } = require("./config/redis");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoint to serve Swagger JSON
app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

let cnt = 0;
app.get("/", (req, res) => {
    cnt++;
    res.send(`
        <h1>Welcome to the chat system!</h1>
        <br>
        <h2>You visited us ${cnt} times</h2>
        <p>Checkout the API documentation on <a href="/api-docs">/api-docs</a></p>
    `);
});
connectToRedis();
app.use(api);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
