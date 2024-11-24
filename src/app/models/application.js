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
            this.hasMany(models.Chat, {
                foreignKey: "application_id",
                as: "chats",
                onDelete: "CASCADE",
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
                    len: {
                        args: [3, 50],
                        msg: "Application name must be between 3 and 50 characters",
                    },
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
                validate: {
                    min: { args: [0], msg: "Chats count cannot be negative" },
                },
            },
        },
        {
            sequelize,
            modelName: "Application",
            tableName: "applications",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",

            // --- for soft delete ---
            // paranoid: true,
            // deletedAt: "deleted_at",

            // hooks: {
            //     beforeCreate: (application) => {
            //         application.token = uuidv4();
            //         console.log("Generated Token:", application.token);
            //     },
            // },
            indexes: [{ unique: true, fields: ["token"] }],
        }
    );

    return Application;
};
