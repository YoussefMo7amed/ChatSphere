describe("Message Service", () => {
    it("should create a message", async () => {
        const applicationToken = "test-app";
        const chat_id = 1;
        const content = "Test Message";
        const message = await messageService.createMessage(
            applicationToken,
            chat_id,
            content
        );
        expect(message.content).toBe(content);
        expect(message.chat_id).toBe(chat_id);
    });

    it("should get all messages", async () => {
        const applicationToken = "test-app";
        const messages = await messageService.getAllMessages(applicationToken);
        expect(messages.length).toBeGreaterThanOrEqual(1);
    });

    it("should get a message by id", async () => {
        const applicationToken = "test-app";
        const chat_id = 1;
        const content = "Test Message";
        const message = await messageService.createMessage(
            applicationToken,
            chat_id,
            content
        );
        const retrievedMessage = await messageService.getMessageById(
            applicationToken,
            message.id
        );
        expect(retrievedMessage).toEqual(message);
    });

    it("should update a message", async () => {
        const applicationToken = "test-app";
        const chat_id = 1;
        const content = "Test Message";
        const message = await messageService.createMessage(
            applicationToken,
            chat_id,
            content
        );
        const newContent = "Updated Test Message";
        const updatedMessage = await messageService.updateMessageById(
            applicationToken,
            message.id,
            { content: newContent }
        );
        expect(updatedMessage.content).toBe(newContent);
    });
});
