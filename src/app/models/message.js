const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Message extends Model {
        static associate(models) {
            // Message belongs to a chat
            this.belongsTo(models.Chat, {
                foreignKey: "chat_id",
                as: "chat",
                onDelete: "CASCADE", 
            });
        }
    }

    Message.init(
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
            body: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: { msg: "Message body cannot be empty" },
                },
            },
            chat_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "chats", key: "id" },
            },
        },
        {
            sequelize,
            modelName: "Message",
            tableName: "messages",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            indexes: [
                {
                    unique: true,
                    fields: ["chat_id", "number"],
                },
            ],
        }
    );

    return Message;
};
