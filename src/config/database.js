module.exports = {
    development: {
        username: "app_user",
        password: "app_password",
        database: "chat_db",
        host: "db",
        dialect: "mysql",
    },
    test: {
        username: "root",
        password: "password",
        database: "chat_system_test",
        host: "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DATABASE_URL,
        dialect: "mysql",
    },
};
