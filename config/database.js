// config/database.js
const { DATABASE_URL } = process.env;
module.exports = {
  url: DATABASE_URL,
};
