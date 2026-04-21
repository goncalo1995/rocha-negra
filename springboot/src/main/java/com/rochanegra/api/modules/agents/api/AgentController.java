package com.rochanegra.api.modules.agents.api;

import com.rochanegra.api.modules.agents.client.OpenRouterClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/agents")
public class AgentController {

    private final OpenRouterClient openRouterClient;

    public AgentController(OpenRouterClient openRouterClient) {
        this.openRouterClient = openRouterClient;
    }

    @PostMapping("/generate-test")
    public ResponseEntity<Map<String, String>> generateTest(@RequestBody Map<String, String> request) {
        String prompt = request.getOrDefault("prompt", "Hello!");
        String model = request.getOrDefault("model", "anthropic/claude-3-haiku");
        
        // Phase 2 hardcoded context
        String context = "Project: Rebrand 2026. Area: Marketing. Goals: Modernize logo, Redefine tone. Target Audience: Gen Z solopreneurs.";
        
        String response = openRouterClient.generateSync(prompt, context, model);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
