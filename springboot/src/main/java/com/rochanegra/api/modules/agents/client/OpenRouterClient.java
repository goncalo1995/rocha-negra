package com.rochanegra.api.modules.agents.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class OpenRouterClient {

    private final RestClient restClient;

    public OpenRouterClient(@Value("${openrouter.api.key:}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("HTTP-Referer", "http://localhost:5173")
                .defaultHeader("X-Title", "Rocha Negra Studio")
                .build();
    }

    public String generateSync(String prompt, String context, String model) {
        Map<String, Object> request = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", "You are an expert Assistant. strictly follow the brand guidelines provided in context. Context:\n" + context),
                Map.of("role", "user", "content", prompt)
            )
        );

        try {
            Map response = restClient.post()
                    .uri("/chat/completions")
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling OpenRouter: " + e.getMessage();
        }
        
        return "No response generated.";
    }
}
