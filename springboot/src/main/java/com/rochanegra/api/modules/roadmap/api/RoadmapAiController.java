package com.rochanegra.api.modules.roadmap.api;

import com.rochanegra.api.modules.agents.client.OpenRouterClient;
import com.rochanegra.api.modules.nodes.service.NodeService;
import com.rochanegra.api.modules.roadmap.domain.ProjectDetails;
import com.rochanegra.api.modules.roadmap.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roadmap/ai")
@RequiredArgsConstructor
public class RoadmapAiController {

    private final OpenRouterClient openRouterClient;
    private final RoadmapService roadmapService;
    private final NodeService nodeService;

    @PostMapping("/refine-step")
    public ResponseEntity<Map<String, String>> refineStep(
            @RequestBody Map<String, String> request) {
        
        UUID nodeId = UUID.fromString(request.get("nodeId"));
        String stepTitle = request.get("title");
        String currentPrompt = request.get("prompt");

        ProjectDetails details = roadmapService.getProjectDetails(nodeId);
        
        String context = String.format(
            "Project Outcome: %s. Main Risk: %s. Current Step: %s.",
            details.getDesiredOutcome(),
            details.getMainRisk(),
            stepTitle
        );

        String systemPrompt = "You are an expert project architect. Refine the following step prompt to be more actionable, specific, and results-oriented.";
        String userPrompt = "Original Prompt: " + currentPrompt;

        String refinedPrompt = openRouterClient.generateSync(userPrompt, context, "anthropic/claude-3-haiku");

        return ResponseEntity.ok(Map.of("refinedPrompt", refinedPrompt));
    }
}
