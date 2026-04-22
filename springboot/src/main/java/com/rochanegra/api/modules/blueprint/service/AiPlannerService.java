package com.rochanegra.api.modules.blueprint.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rochanegra.api.common.exception.ForbiddenException;
import com.rochanegra.api.modules.agents.client.OpenRouterClient;
import com.rochanegra.api.modules.blueprint.domain.BlueprintStep;
import com.rochanegra.api.modules.blueprint.dto.AiPlanGenerateRequest;
import com.rochanegra.api.modules.blueprint.dto.AiPlanGenerateResponse;
import com.rochanegra.api.modules.blueprint.dto.RefineStepRequest;
import com.rochanegra.api.modules.blueprint.repository.BlueprintStepRepository;
import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.repository.NodeRepository;
import com.rochanegra.api.modules.tasks.TaskStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiPlannerService {

    private final OpenRouterClient openRouterClient;
    private final NodeRepository nodeRepository;
    private final BlueprintStepRepository blueprintStepRepository;
    private final ObjectMapper objectMapper;

    private static final String PLANNER_MODEL = "anthropic/claude-sonnet-4.6";
    private static final String ANALYZER_MODEL = "google/gemini-2.5-flash"; // "anthropic/claude-sonnet-4.6";

    private static final Set<UUID> BETA_ALLOWED_USER_IDS = Set.of(
            UUID.fromString("1e7a642d-41c6-4d34-b437-8c6780d66a0b"));

    public boolean isBetaAllowed(UUID userId) {
        return BETA_ALLOWED_USER_IDS.contains(userId);
    }

    @Transactional
    public void generatePlanForNode(UUID nodeId, UUID userId, AiPlanGenerateRequest request) {
        if (!isBetaAllowed(userId)) {
            throw new ForbiddenException("Beta access restricted. Contact admin for early access.");
        }
        // 1. Fetch Context
        StringBuilder context = new StringBuilder();
        if (request.contextNodeIds() != null && !request.contextNodeIds().isEmpty()) {
            List<Node> contextNodes = nodeRepository.findAllById(request.contextNodeIds());
            for (Node node : contextNodes) {
                context.append("--- Context from Node: ").append(node.getName()).append(" ---\n");
                context.append(node.getContent()).append("\n\n");
            }
        }

        // 2. Construct Prompt
        String systemPrompt = """
                You are an expert project planner following the Principles of Top-Down Design.
                Your goal is to break down a complex user goal into a clear, hierarchical set of actionable steps.
                Start with high-level phases (e.g., 'Phase 1: Research', 'Phase 2: Development') and then break those down into smaller, concrete sub-steps.
                A good step is small enough to be completed in a single work session.

                Respond ONLY in a strictly valid JSON array format like this:
                [{ "title": "...", "description": "...", "children": [{ "title": "...", "description": "...", "children": [] }] }]
                """;

        // String SYSTEM_PROMPT = """
        // You are an expert project planner following Top-Down Design.

        // CRITICAL RULES:
        // 1. MAXIMUM 3 LEVELS DEEP (Phases → Milestones → Tasks)
        // 2. MAXIMUM 15-20 TOTAL STEPS for a project
        // 3. Each step should take 2-4 hours, NOT single work sessions
        // 4. Focus on HIGH-LEVEL deliverables, not micro-tasks

        // Example structure (for "Build a website"):
        // [
        // {
        // "title": "Phase 1: Planning",
        // "description": "Foundation work before building",
        // "children": [
        // {"title": "Define requirements", "description": "Get specs from
        // stakeholders", "children": []},
        // {"title": "Create wireframes", "description": "Low-fidelity mockups",
        // "children": []}
        // ]
        // },
        // {
        // "title": "Phase 2: Development",
        // "description": "Core building phase",
        // "children": [
        // {"title": "Build homepage", "description": "Implement main layout",
        // "children": []}
        // ]
        // }
        // ]

        // Respond ONLY in valid JSON array format.
        // """;

        String userPrompt = "Goal: " + request.goal() + "\n\nAdditional Context:\n" + context;

        // 3. Call OpenRouter
        String responseText = openRouterClient.generateSync(userPrompt, systemPrompt, PLANNER_MODEL);

        if (responseText == null || responseText.trim().isEmpty() || responseText.trim().length() < 50) {
            log.error("AI response too short or empty: {}", responseText);
            throw new RuntimeException("AI returned empty response. Check OpenRouter credits/model availability.");
        }

        try {
            // Clean markdown blocks if present
            String jsonClean = cleanJsonResponse(responseText);
            List<AiPlanGenerateResponse> plan = objectMapper.readValue(jsonClean,
                    new TypeReference<List<AiPlanGenerateResponse>>() {
                    });

            // 4. Save Recursively
            savePlanSteps(nodeId, userId, null, plan, 0);

        } catch (Exception e) {
            log.error("Failed to parse or save AI plan", e);
            throw new RuntimeException("AI Plan generation failed: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public String analyzeStep(UUID stepId, UUID userId) {
        if (!isBetaAllowed(userId)) {
            throw new ForbiddenException("Beta access restricted. Contact admin for early access.");
        }
        BlueprintStep step = blueprintStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));

        String systemPrompt = "You are a project management auditor. Analyze the following project step for clarity, risks, and completeness. Provide a brief, professional critique.";
        String userPrompt = "Step Title: " + step.getTitle() + "\nDescription: " + step.getDescription();

        return openRouterClient.generateSync(userPrompt, systemPrompt, ANALYZER_MODEL);
    }

    @Transactional
    public void refineStep(UUID stepId, UUID userId, RefineStepRequest request) {
        if (!isBetaAllowed(userId)) {
            throw new ForbiddenException("Beta access restricted. Contact admin for early access.");
        }
        BlueprintStep existingStep = blueprintStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));

        // Build context of existing step + its children
        StringBuilder existingContext = new StringBuilder();
        existingContext.append("Current Step Title: ").append(existingStep.getTitle()).append("\n");
        existingContext.append("Current Description: ").append(existingStep.getDescription()).append("\n");

        if (!existingStep.getChildren().isEmpty()) {
            existingContext.append("\nExisting Sub-steps:\n");
            for (BlueprintStep child : existingStep.getChildren()) {
                existingContext.append("- ").append(child.getTitle()).append("\n");
            }
        }

        String systemPrompt = """
                You are refining an existing project step. Keep what works, improve what doesn't.
                Respond with a JSON object: { "title": "...", "description": "...", "children": [...] }
                """;

        String userPrompt = """
                User Request: """ + request.refinementGoal() + """

                """ + existingContext + """

                Based on the request, provide an improved version of this step and its sub-steps.
                Keep the same structure but refine content.
                """;

        String responseText = openRouterClient.generateSync(userPrompt, systemPrompt, PLANNER_MODEL);

        // Parse and update the step (don't delete children, update them)
        // ... parsing logic ...
    }

    private void savePlanSteps(UUID nodeId, UUID userId, BlueprintStep parent,
            List<AiPlanGenerateResponse> planResponses, int startPosition) {
        if (planResponses == null)
            return;

        for (int i = 0; i < planResponses.size(); i++) {
            AiPlanGenerateResponse resp = planResponses.get(i);

            BlueprintStep step = new BlueprintStep();
            step.setNodeId(nodeId);
            step.setUserId(userId);
            step.setParent(parent);
            step.setPosition(startPosition + i);
            step.setTitle(resp.title());
            step.setDescription(resp.description());
            step.setStatus(TaskStatus.TODO);

            BlueprintStep saved = blueprintStepRepository.save(step);

            if (resp.children() != null && !resp.children().isEmpty()) {
                savePlanSteps(nodeId, userId, saved, resp.children(), 0);
            }
        }
    }

    private String cleanJsonResponse(String response) {
        if (response.contains("```json")) {
            return response.substring(response.indexOf("```json") + 7, response.lastIndexOf("```")).trim();
        } else if (response.contains("```")) {
            return response.substring(response.indexOf("```") + 3, response.lastIndexOf("```")).trim();
        }
        return response.trim();
    }
}
