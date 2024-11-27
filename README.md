# ChatSphere (Chat System API)

## Overview

This project implements a **chat system backend API** built with **Node.js**, **Express**, **Sequelize** (for MySQL), **Redis**, **RabbitMQ**, and **ElasticSearch**. The system manages **applications**, **chats**, and **messages**, providing APIs to create, retrieve, and manage chats and messages in real-time.

## Features

-   **Create and manage applications**.
-   **Create chats** and **send messages**.
-   **Optimized with Redis** for caching and performance.
-   **RabbitMQ** used for queuing tasks (e.g., updating chat counts. update elastic search indexes).
-   **ElasticSearch** integration for indexing and searching chat messages.
-   API endpoints documented with **Swagger**.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MySQL, Sequelize ORM
-   **Caching**: Redis
-   **Queueing**: RabbitMQ
-   **Search**: ElasticSearch
-   **API Documentation**: Swagger UI
-   **Task Scheduling**: Node-Cron, Worker Threads

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YoussefMo7amed/ChatSphere.git
cd ChatSphere
```

### 2. Install Docker and Docker Compose

If you don’t have **Docker** and **Docker Compose** installed, follow the instructions below to install them:

-   **Install Docker**: [Docker Installation Guide](https://docs.docker.com/get-docker/)
-   **Install Docker Compose**: [Docker Compose Installation Guide](https://docs.docker.com/compose/install/)

### 3. Start the Application with Docker

Once **Docker** and **Docker Compose** are installed, use the following command to build and start all services (MySQL, Redis, RabbitMQ, ElasticSearch, and Node.js) using **docker-compose**:

```bash
docker-compose up --build
```

This will:

-   Build the Docker images for all the services.
-   Start the **MySQL**, **Redis**, **RabbitMQ**, **ElasticSearch**, and **Node.js** containers.

### 4. Access the Application

Once the Docker containers are up and running, you can access the application at:

-   **API documentation**: `http://localhost:3000/api-docs`
-   **Main landing page**: `http://localhost:3000`

The application should be running on **port 3000** by default.

### 5. Additional Configuration (Optional)

If you need to set environment variables manually, create a `.env` file in the root directory with the following values:

```bash
RABBITMQ_URL=amqp://localhost
REDIS_URL=redis://localhost:6379
DATABASE_URL=mysql://username:password@localhost:3306/chat_system
ELASTICSEARCH_URL=http://localhost:9200
```

### 6. Stopping the Application

To stop the services, run:

```bash
docker-compose down
```

This will stop and remove all running containers.

---

### **Note**:

-   **Docker & Docker Compose**: Ensure that you have **Docker** and **Docker Compose** installed on your machine. If you don’t have them installed, follow the installation instructions linked above.

## API Documentation

The API is documented using **Swagger UI**. Once the app is running, visit the following URL to explore the API documentation:

```
http://localhost:3000/api-docs
```

### API Endpoints

-   **POST /applications** - Create a new application.
-   **GET /applications** - Get all applications.
-   **GET /applications/:token** - Get a specific application by token.
-   **POST /:token/chats** - Create a new chat for a given application.
-   **GET /:token/chats** - Get all chats for a given application.
-   **POST /:token/chats/:chatNumber/messages** - Send a message to a chat.
-   **GET /:token/chats/:chatNumber/messages** - Get all messages in a chat.

## Docs Directory

The **docs/** directory contains important documentation files for the project:

-   **Database Design**:
    -   `Database Design.drawio` - A visual diagram of the database design.
    -   `Database Design.jpg` - An image version of the database diagram.
    -   `database.md` - Detailed explanation of the database design.
    -   `database-thinking.md` - Thoughts and considerations during the database design process.
-   **Swagger JSON**:
    -   `swagger.json` - The JSON version of the API documentation, which is used by Swagger UI.

## Testing

### Running Unit Tests

Unit tests are provided for services, controllers, and repositories. To run the tests, use the following command:

```bash
npm test
```

This will run **Jest** tests in the `tests/unit` folder.

### Running Integration Tests

To run the integration tests, use the following command:

```bash
npm run test:integration
```

Integration tests are in the `tests/integration` folder, testing the interactions with the database and other services.

### Running Repository Tests

To run tests for the repositories (interactions with the database), use:

```bash
npm run test:repositories
```

## Worker and Cron Jobs

### Chat Count Job

The **chat count job** is scheduled to run periodically, processing the `chat_creation_queue` messages from RabbitMQ to update the `chats_count` in the database.

-   **Job Scheduler**: Node-Cron
-   **Worker Thread**: `worker_threads` is used to offload long-running tasks like updating the chat count asynchronously.

### Queue Processing

Tasks related to chat creation and message processing are published to RabbitMQ, and worker threads consume these tasks and update the database asynchronously.

### ElasticSearch Worker

The system also includes a worker for indexing messages to ElasticSearch to enable full-text search across messages.

## Logs

-   Logs are stored in the `logs/` folder.
-   The **combined log** is used for regular activity, and the **error log** contains any errors that occur during runtime.

## Directory Structure

```
.
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Dockerfile for Node.js app
├── docs                       # Documentation files (database design, Swagger JSON)
├── migrations                 # Sequelize migration files
├── public                     # Public files (e.g., images, static assets)
├── README.md                  # Project documentation
├── seeders                    # Sequelize seed files
└── src                        # Application source code
    ├── app
    │   ├── controllers        # Controllers for handling API requests
    │   ├── models             # Sequelize models
    │   ├── repositories       # Database interactions (CRUD operations)
    │   ├── routes             # API routes
    │   └── services           # Business logic
    ├── config                 # Config files (database, Redis, RabbitMQ)
    ├── index.js               # Main entry point for the app
    ├── jobs                   # Cron jobs and worker threads
    ├── logs                   # Log files
    ├── middlewares            # Middleware functions (error handling, validation)
    ├── package.json           # Project dependencies
    ├── tests                  # Unit and integration tests
    ├── utils                  # Helper functions (cache utils, logging, etc.)
    └── workers                # Background worker threads
```

## License

This project is licensed under the MIT License.
