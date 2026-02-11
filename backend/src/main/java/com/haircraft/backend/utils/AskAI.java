package com.haircraft.backend.utils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

@Component
public class AskAI {

    private final ChatClient chatClient;

    // Spring automatically provides the builder with your OpenRouter settings
    public AskAI(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    /**
     * Simple utility method to get a response from OpenRouter
     */
    public String getAnswer(String message) {
        return chatClient.prompt()
                .user(message)
                .call()
                .content();
    }

    /**
     * Advanced version for your "Bot" logic (with system instructions)
     */
    public String getBotAnswer(String systemInstructions, String userMessage) {
        return chatClient.prompt()
                .system(systemInstructions)
                .user(userMessage)
                .call()
                .content();
    }
}