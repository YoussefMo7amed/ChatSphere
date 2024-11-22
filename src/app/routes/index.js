const express = require("express");
const app = express();

const applicationRoutes = require("./applicationRoutes");
const chatRoutes = require("./chatRoutes");
const messageRoutes = require("./messageRoutes");

app.use("/applications", applicationRoutes);
app.use("/applications/:token/chats", chatRoutes);
app.use("/applications/:token/chats/:chatNumber/messages", messageRoutes);

module.exports = app;
