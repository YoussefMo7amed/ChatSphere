const { Model, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

/**
 * Returns the Application model class.
 * @param {Sequelize} sequelize The Sequelize instance.
 * @returns {Application} The Application model class.
 */

module.exports = (sequelize) => {
    class Application extends Model {
        static associate(models) {
            // Application has many chats
            this.hasMany(models.Chat, {
                foreignKey: "application_id",
                as: "chats",
                onDelete: "CASCADE", // Deletes all chats when an application is deleted
            });
        }
    }

    Application.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: { msg: "Application name cannot be empty" },
                },
            },
            token: {
                type: DataTypes.UUID,
                unique: true,
                allowNull: false,
                defaultValue: uuidv4,
            },
            chats_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: "Application",
            tableName: "applications",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Application;
};
