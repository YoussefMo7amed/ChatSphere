// src/index.js
const express = require("express");
require("dotenv").config();

const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;
const elasticUrl = process.env.ELASTIC_URL;

// const { databaseConfig } = require("../config/database");
// const { REDIS_URL } = require("../config/redis");
// const { elasticsearchConfig } = require("../config/elasticsearch");

const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let cnt = 0;
app.get("/", (req, res) => {
  cnt++;
  console.log("weolcon dfkodnkofdjf");
  res.send(
    `<h1>Welcome to the chat system!<h1> <br> <h2>you visited us ${cnt} times<h2>`
  );
});

const redis = require("redis");
const client = redis.createClient({ url: process.env.REDIS_URL });

client.on("connect", () => console.log("Connected to Redis"));
client.on("error", (err) => console.error("Redis Error:", err));

client.connect();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
