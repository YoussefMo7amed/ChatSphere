const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../../config/database")[env];

const db = {};

// Initialize Sequelize without creating or syncing the database
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: config.dialect,
        logging: false,
        pool: {
            max: 10, // Maximum number of connections
            min: 0, // Minimum number of connections
            acquire: 30000, // Timeout for acquiring a connection
            idle: 10000, // Time before an idle connection is released
        },
    }
);

// Dynamically load all models in the folder
fs.readdirSync(__dirname)
    .filter(
        (file) =>
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
    )
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize);
        db[model.name] = model;
    });

// Set up associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Export the Sequelize instance and models without reinitializing
db.sequelize = sequelize;
module.exports = db;
