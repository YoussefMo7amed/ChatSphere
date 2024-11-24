const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, errors, json } = format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}] ${stack || message}`;
});

// Create a logger instance
const logger = createLogger({
    level: process.env.LOG_LEVEL || "info", // Default to 'info', can be overridden by env
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }), // Log stack traces for errors
        process.env.NODE_ENV === "production" ? json() : colorize(),
        logFormat
    ),
    transports: [
        new transports.Console(), // Log to the console
        new transports.File({ filename: "logs/error.log", level: "error" }), // Log errors to a file
        new transports.File({ filename: "logs/combined.log" }), // Log all levels to a file
    ],
});

// If in development, add more verbose logging
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: combine(colorize(), logFormat),
        })
    );
}

module.exports = logger;
