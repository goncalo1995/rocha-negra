package com.rochanegra.api.modules.blueprint.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.rochanegra.api.modules.blueprint.dto.AiPlanGenerateRequest;
import com.rochanegra.api.modules.blueprint.dto.BlueprintStepCreateDto;
import com.rochanegra.api.modules.blueprint.dto.BlueprintStepDto;
import com.rochanegra.api.modules.blueprint.dto.BlueprintStepUpdateDto;
import com.rochanegra.api.modules.blueprint.dto.RefineStepRequest;
import com.rochanegra.api.modules.blueprint.dto.ReorderStepsRequest;
import com.rochanegra.api.modules.blueprint.service.AiPlannerService;
import com.rochanegra.api.modules.blueprint.service.BlueprintService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BlueprintController {

    private final BlueprintService blueprintService;
    private final AiPlannerService aiPlannerService;

    // --- BLUEPRINT CRUD ---

    @GetMapping("/nodes/{nodeId}/blueprint")
    public ResponseEntity<List<BlueprintStepDto>> getBlueprint(@PathVariable UUID nodeId) {
        return ResponseEntity.ok(blueprintService.getBlueprintForNode(nodeId));
    }

    @PostMapping("/nodes/{nodeId}/blueprint/steps")
    public ResponseEntity<BlueprintStepDto> createStep(@PathVariable UUID nodeId,
            @RequestBody BlueprintStepCreateDto dto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(blueprintService.createStep(nodeId, userId, dto));
    }

    @PatchMapping("/blueprint/steps/{stepId}")
    public ResponseEntity<BlueprintStepDto> updateStep(@PathVariable UUID stepId,
            @RequestBody BlueprintStepUpdateDto dto) {
        return ResponseEntity.ok(blueprintService.updateStep(stepId, dto));
    }

    @DeleteMapping("/blueprint/steps/{stepId}")
    public ResponseEntity<Void> deleteStep(@PathVariable UUID stepId) {
        blueprintService.deleteStep(stepId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/blueprint/steps/reorder")
    public ResponseEntity<Void> reorderSteps(@RequestBody ReorderStepsRequest request) {
        blueprintService.reorderSteps(request.parentId(), request.orderedStepIds());
        return ResponseEntity.ok().build();
    }

    // --- AI PLANNER ---

    @PostMapping("/nodes/{nodeId}/blueprint/generate-plan")
    public ResponseEntity<Void> generatePlan(@PathVariable UUID nodeId,
            @RequestBody AiPlanGenerateRequest request,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        aiPlannerService.generatePlanForNode(nodeId, userId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/blueprint/steps/{stepId}/analyze")
    public ResponseEntity<Map<String, String>> analyzeStep(@PathVariable UUID stepId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        String analysis = aiPlannerService.analyzeStep(stepId, userId);
        return ResponseEntity.ok(Map.of("analysis", analysis));
    }

    @PostMapping("/blueprint/steps/{stepId}/refine")
    public ResponseEntity<Void> refineStep(@PathVariable UUID stepId,
            @RequestBody RefineStepRequest request,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        aiPlannerService.refineStep(stepId, userId, request);
        return ResponseEntity.ok().build();
    }
}
