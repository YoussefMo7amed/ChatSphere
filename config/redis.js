require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL;

console.log(REDIS_URL);

module.exports = {
  REDIS_URL,
};
