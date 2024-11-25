const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Chat extends Model {
        static associate(models) {
            // Chat belongs to an application
            this.belongsTo(models.Application, {
                foreignKey: "application_id",
                as: "application",
                onDelete: "CASCADE",
            });

            // Chat has many messages
            this.hasMany(models.Message, {
                foreignKey: "chat_id",
                as: "messages",
                onDelete: "CASCADE",
            });
        }
    }

    Chat.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            number: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            application_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "applications", key: "id" },
            },
            messages_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: "Chat",
            tableName: "chats",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            indexes: [
                {
                    unique: true,
                    fields: ["application_id", "number"],
                },
            ],
        }
    );

    return Chat;
};
