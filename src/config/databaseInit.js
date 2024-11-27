const { sequelize } = require("../app/models");

async function initializeDatabase() {
    try {
        // Create the database if it doesn't exist
        await sequelize.query(
            `CREATE DATABASE IF NOT EXISTS \`${sequelize.config.database}\`;`
        );
        console.log("Database created if not existed.");

        // Authenticate the connection
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");

        // Synchronize models with the database
        await sequelize.sync({ alter: true }); // Use { force: true } for a clean reset
        console.log("All models were synchronized successfully.");
    } catch (err) {
        console.error("Database initialization failed:", err);
        throw err;
    }
}

module.exports = { initializeDatabase };
