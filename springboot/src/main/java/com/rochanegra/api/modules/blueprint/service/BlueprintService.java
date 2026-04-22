package com.rochanegra.api.modules.blueprint.service;

import com.rochanegra.api.modules.blueprint.domain.BlueprintStep;
import com.rochanegra.api.modules.blueprint.dto.BlueprintStepCreateDto;
import com.rochanegra.api.modules.blueprint.dto.BlueprintStepDto;
import com.rochanegra.api.modules.blueprint.dto.BlueprintStepUpdateDto;
import com.rochanegra.api.modules.blueprint.repository.BlueprintStepRepository;
import com.rochanegra.api.modules.tasks.TaskStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlueprintService {

    private final BlueprintStepRepository repository;

    @Transactional(readOnly = true)
    public List<BlueprintStepDto> getBlueprintForNode(UUID nodeId) {
        List<BlueprintStep> steps = repository.findByNodeIdOrderByPositionAsc(nodeId);
        return steps.stream()
                .map(step -> new BlueprintStepDto(
                        step.getId(),
                        step.getNodeId(),
                        step.getParent() != null ? step.getParent().getId() : null, // parentId only
                        step.getPosition(),
                        step.getTitle(),
                        step.getDescription(),
                        step.getStatus(),
                        step.getContextNodeIds(),
                        step.getDetails(),
                        step.getCreatedAt(),
                        step.getUpdatedAt()
                // NO children field in DTO
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public BlueprintStepDto createStep(UUID nodeId, UUID userId, BlueprintStepCreateDto dto) {
        BlueprintStep step = new BlueprintStep();
        step.setNodeId(nodeId);
        step.setUserId(userId);
        step.setTitle(dto.title());
        step.setDescription(dto.description());
        step.setStatus(dto.status() != null ? dto.status() : TaskStatus.TODO);
        step.setContextNodeIds(dto.contextNodeIds());
        step.setDetails(dto.details());

        if (dto.parentId() != null) {
            BlueprintStep parent = repository.findById(dto.parentId())
                    .orElseThrow(() -> new RuntimeException("Parent step not found"));
            step.setParent(parent);
            step.setPosition(parent.getChildren().size());
        } else {
            List<BlueprintStep> roots = repository.findByNodeIdAndParentIsNullOrderByPositionAsc(nodeId);
            step.setPosition(roots.size());
        }

        return mapToDto(repository.save(step));
    }

    @Transactional
    public BlueprintStepDto updateStep(UUID stepId, BlueprintStepUpdateDto dto) {
        BlueprintStep step = repository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));

        // VALIDATION: Cannot mark as DONE if incomplete children exist
        if (dto.status() == TaskStatus.DONE && step.getChildren() != null && !step.getChildren().isEmpty()) {
            boolean hasIncompleteChildren = step.getChildren().stream()
                    .anyMatch(child -> child.getStatus() != TaskStatus.DONE);

            if (hasIncompleteChildren) {
                throw new IllegalStateException(
                        "Cannot complete step '" + step.getTitle() + "' because it has incomplete sub-steps. " +
                                "Complete or delete child steps first.");
            }
        }

        // Optional: Auto-complete parent when all children are done
        if (dto.status() == TaskStatus.DONE && step.getParent() != null) {
            BlueprintStep parent = step.getParent();
            boolean allChildrenDone = parent.getChildren().stream()
                    .filter(child -> child.getId() != stepId)
                    .allMatch(child -> child.getStatus() == TaskStatus.DONE);

            if (allChildrenDone && parent.getStatus() != TaskStatus.DONE) {
                parent.setStatus(TaskStatus.DONE);
                repository.save(parent);
                log.info("Auto-completed parent step: {}", parent.getTitle());
            }
        }

        if (dto.title() != null)
            step.setTitle(dto.title());
        if (dto.description() != null)
            step.setDescription(dto.description());
        if (dto.status() != null)
            step.setStatus(dto.status());
        if (dto.contextNodeIds() != null)
            step.setContextNodeIds(dto.contextNodeIds());
        if (dto.details() != null)
            step.setDetails(dto.details());
        if (dto.position() != null)
            step.setPosition(dto.position());

        return mapToDto(repository.save(step));
    }

    @Transactional
    public void deleteStep(UUID stepId) {
        repository.deleteById(stepId);
    }

    @Transactional
    public void reorderSteps(UUID parentId, List<UUID> orderedStepIds) {
        for (int i = 0; i < orderedStepIds.size(); i++) {
            UUID stepId = orderedStepIds.get(i);
            BlueprintStep step = repository.findById(stepId)
                    .orElseThrow(() -> new RuntimeException("Step not found: " + stepId));
            step.setPosition(i);

            // Handle cross-parent dragging if necessary
            // (Currently dnd-kit implementation in frontend will mostly send sibling IDs)
            // But we ensure the parent matches if specified
            if (parentId != null) {
                BlueprintStep newParent = repository.findById(parentId)
                        .orElseThrow(() -> new RuntimeException("New parent not found"));
                step.setParent(newParent);
            } else {
                step.setParent(null);
            }

            repository.save(step);
        }
    }

    private BlueprintStepDto mapToDto(BlueprintStep step) {
        return new BlueprintStepDto(
                step.getId(),
                step.getNodeId(),
                step.getParent() != null ? step.getParent().getId() : null,
                step.getPosition(),
                step.getTitle(),
                step.getDescription(),
                step.getStatus(),
                step.getContextNodeIds(),
                step.getDetails(),
                step.getCreatedAt(),
                step.getUpdatedAt());
    }
}
