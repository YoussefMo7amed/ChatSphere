require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({ node: process.env.ELASTIC_URL });

module.exports = esClient;


