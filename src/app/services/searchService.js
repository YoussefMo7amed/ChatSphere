const elasticClient = require("../../config/elasticsearch");

/**
 * Service for handling search-related operations.
 */
class SearchService {
    /**
     * Indexes a message in Elasticsearch.
     * @param {Object} message - The message object to index.
     * @param {string} index - The Elasticsearch index name.
     * @returns {Promise<void>}
     */
    async indexMessage(message, index = "messages") {
        try {
            await elasticClient.index({
                index,
                id: message.id,
                document: {
                    id: message.id,
                    number: message.number,
                    body: message.body,
                    chatId: message.chat_id,
                    createdAt: message.created_at,
                },
            });
            console.log(`Message ${message.id} indexed successfully`);
        } catch (error) {
            console.error("Error indexing message:", error);
            throw error;
        }
    }
    /**
     * Indexes multiple messages in Elasticsearch in bulk.
     * @param {array} messages - Array of message objects to index.
     * @param {string} index - The Elasticsearch index name.
     * @returns {Promise<void>}
     */
    async indexMessagesBulk(messages, index = "messages") {
        try {
            const body = messages.flatMap((doc) => [
                { index: { _index: index, _id: doc.id } },
                {
                    id: doc.id,
                    number: doc.number,
                    body: doc.body,
                    chatId: doc.chat_id,
                    createdAt: doc.created_at,
                },
            ]);

            const result = await elasticClient.bulk({ body });
            if (result.errors) {
                for (const error of result.itemsWithErrors) {
                    console.error("Error indexing message:", error);
                }
            } else {
                console.log(`Bulk indexed ${messages.length} messages`);
                console.log(
                    `Confirmation message: ${result.body.items[0].index.result}`
                );
            }
        } catch (error) {
            console.error("Error indexing messages in bulk:", error);
            throw error;
        }
    }
    async searchMessages(searchText, filterers = [], index = "messages") {
        try {
            const query = {
                match: {
                    body: searchText,
                },
            };

            if (filterers.length > 0) {
                query.bool = {
                    must: [query],
                    filter: filterers,
                };
            }

            const result = await elasticClient.search({
                index: index,
                body: {
                    query,
                },
            });

            return result.hits.hits; // Returns the matched documents
        } catch (error) {
            console.error("Error searching messages:", error);
            throw error;
        }
    }

    async searchMessagesWithWildcard(
        searchText,
        filterers = [],
        index = "messages"
    ) {
        try {
            const body = {
                query: {
                    bool: {
                        must: [
                            {
                                wildcard: {
                                    body: `*${searchText}*`,
                                },
                            },
                        ],
                        filter: filterers,
                    },
                },
            };

            const result = await elasticClient.search({
                index: index,
                body,
            });

            const messages = result.hits.hits;
            const total = result.hits.total.value;

            return { messages, total };
        } catch (error) {
            console.error("Error searching messages:", error);
            throw error;
        }
    }
}

module.exports = new SearchService();
