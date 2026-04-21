package com.rochanegra.api.modules.roadmap.api;

import com.rochanegra.api.modules.roadmap.dto.RoadmapStepCreateDto;
import com.rochanegra.api.modules.roadmap.dto.RoadmapStepDto;
import com.rochanegra.api.modules.roadmap.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping("/{nodeId}")
    public ResponseEntity<List<RoadmapStepDto>> getRoadmap(@PathVariable UUID nodeId) {
        return ResponseEntity.ok(roadmapService.getRoadmap(nodeId));
    }

    @PostMapping("/{nodeId}/steps")
    public ResponseEntity<RoadmapStepDto> createStep(
            @PathVariable UUID nodeId,
            @RequestBody RoadmapStepCreateDto dto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(roadmapService.createStep(nodeId, dto, userId));
    }

    @PatchMapping("/steps/{stepId}")
    public ResponseEntity<RoadmapStepDto> updateStep(
            @PathVariable UUID stepId,
            @RequestBody RoadmapStepCreateDto dto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(roadmapService.updateStep(stepId, dto, userId));
    }

    @DeleteMapping("/steps/{stepId}")
    public ResponseEntity<Void> deleteStep(@PathVariable UUID stepId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        roadmapService.deleteStep(stepId, userId);
        return ResponseEntity.noContent().build();
    }
}
