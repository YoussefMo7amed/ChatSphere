const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../../config/database")[env];

const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    { host: config.host, dialect: config.dialect }
);

try {
    sequelize.authenticate();
    console.log("Connection has been established successfully.");
} catch (err) {
    console.error("Unable to connect to the database:", err);
}

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

// Synchronize models with the database
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("All models were synchronized successfully.");
    })
    .catch((err) => {
        console.error("An error occurred while synchronizing models:", err);
    });

db.sequelize = sequelize;
module.exports = db;
