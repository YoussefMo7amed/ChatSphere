## **Design With Relationships and Indexing**

#### **`Application` Table**

| **Field**     | **Type**  | **Constraints**             |
| ------------- | --------- | --------------------------- |
| `id`          | INTEGER   | Primary Key, Auto-Increment |
| `name`        | STRING    | Not Null                    |
| `token`       | UUID      | Unique, Not Null            |
| `chats_count` | INTEGER   | Default: 0                  |
| `created_at`  | TIMESTAMP | Auto-generated              |
| `updated_at`  | TIMESTAMP | Auto-generated              |

-   **Indexes**:

    -   `token` (Unique)

-   **Relationships**:
    -   Has many `chats` (`ON DELETE CASCADE`).

---

#### **`Chat` Table**

| **Field**        | **Type**  | **Constraints**             |
| ---------------- | --------- | --------------------------- |
| `id`             | INTEGER   | Primary Key, Auto-Increment |
| `number`         | INTEGER   | Unique per `application_id` |
| `application_id` | INTEGER   | Foreign Key, Not Null       |
| `messages_count` | INTEGER   | Default: 0                  |
| `created_at`     | TIMESTAMP | Auto-generated              |
| `updated_at`     | TIMESTAMP | Auto-generated              |

-   **Indexes**:

    -   Composite index on (`application_id`,`number` ) (Unique)

-   **Relationships**:
    -   Belongs to `application` (`ON DELETE CASCADE`).
    -   Has many `messages` (`ON DELETE CASCADE`).

---

#### **`Message` Table**

| **Field**    | **Type**  | **Constraints**             |
| ------------ | --------- | --------------------------- |
| `id`         | INTEGER   | Primary Key, Auto-Increment |
| `number`     | INTEGER   | Unique per `chat_id`        |
| `body`       | TEXT      | Not Null                    |
| `chat_id`    | INTEGER   | Foreign Key, Not Null       |
| `created_at` | TIMESTAMP | Auto-generated              |
| `updated_at` | TIMESTAMP | Auto-generated              |

-   **Indexes**:

    -   Composite index on (`chat_id`, `number`) (Unique)

-   **Relationships**:
    -   Belongs to `chat` (`ON DELETE CASCADE`).

---

### **UML Diagram**

![Database UML Diagram](Database%20Design.jpg)

---
