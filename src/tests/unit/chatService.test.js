describe("Chat Service", () => {
    it("should create a chat", async () => {
        const applicationToken = "test-app";
        const chatName = "Test Chat";
        const chat = await chatService.createChat(applicationToken, chatName);
        expect(chat.name).toBe(chatName);
        expect(chat.applicationToken).toBe(applicationToken);
    });

    it("should get all chats", async () => {
        const applicationToken = "test-app";
        const chats = await chatService.getAllChats(applicationToken);
        expect(chats.length).toBeGreaterThanOrEqual(1);
    });

    it("should get a chat by id", async () => {
        const applicationToken = "test-app";
        const chatName = "Test Chat";
        const chat = await chatService.createChat(applicationToken, chatName);
        const retrievedChat = await chatService.getChatById(
            applicationToken,
            chat.id
        );
        expect(retrievedChat).toEqual(chat);
    });

    it("should update a chat", async () => {
        const applicationToken = "test-app";
        const chatName = "Test Chat";
        const chat = await chatService.createChat(applicationToken, chatName);
        const newChatName = "Updated Test Chat";
        const updatedChat = await chatService.updateChatById(
            applicationToken,
            chat.id,
            { name: newChatName }
        );
        expect(updatedChat.name).toBe(newChatName);
    });

    it("should delete a chat", async () => {
        const applicationToken = "test-app";
        const chatName = "Test Chat";
        const chat = await chatService.createChat(applicationToken, chatName);
        await chatService.deleteChatById(applicationToken, chat.id);
        const retrievedChat = await chatService.getChatById(
            applicationToken,
            chat.id
        );
        expect(retrievedChat).toBeNull();
    });
});
