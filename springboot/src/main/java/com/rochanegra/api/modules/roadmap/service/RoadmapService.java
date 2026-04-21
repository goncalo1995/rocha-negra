package com.rochanegra.api.modules.roadmap.service;

import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.service.NodeService;
import com.rochanegra.api.modules.roadmap.domain.ProjectDetails;
import com.rochanegra.api.modules.roadmap.domain.RoadmapStep;
import com.rochanegra.api.modules.roadmap.dto.RoadmapStepCreateDto;
import com.rochanegra.api.modules.roadmap.dto.RoadmapStepDto;
import com.rochanegra.api.modules.roadmap.repository.ProjectDetailsRepository;
import com.rochanegra.api.modules.roadmap.repository.RoadmapStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final RoadmapStepRepository stepRepository;
    private final ProjectDetailsRepository detailsRepository;
    private final NodeService nodeService;

    public List<RoadmapStepDto> getRoadmap(UUID nodeId) {
        return stepRepository.findAllByNodeIdOrderByPositionAsc(nodeId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoadmapStepDto createStep(UUID nodeId, RoadmapStepCreateDto dto, UUID userId) {
        Node node = nodeService.validateCanEdit(nodeId, userId);
        nodeService.validateIsProject(node);

        List<RoadmapStep> existingSteps = stepRepository.findAllByNodeIdOrderByPositionAsc(nodeId);
        BigDecimal nextPosition = existingSteps.isEmpty() ? 
            BigDecimal.valueOf(1000) : 
            existingSteps.get(existingSteps.size() - 1).getPosition().add(BigDecimal.valueOf(1000));

        RoadmapStep step = new RoadmapStep();
        step.setNodeId(nodeId);
        step.setTitle(dto.title());
        step.setParentStepId(dto.parentStepId());
        step.setDefinitionOfDone(dto.definitionOfDone());
        step.setPrompt(dto.prompt());
        step.setContextNodeIds(dto.contextNodeIds());
        step.setPosition(nextPosition);

        return mapToDto(stepRepository.save(step));
    }

    @Transactional
    public RoadmapStepDto updateStep(UUID stepId, RoadmapStepCreateDto dto, UUID userId) {
        RoadmapStep step = stepRepository.findById(stepId)
                .orElseThrow(() -> new com.rochanegra.api.common.exception.ResourceNotFoundException("Step not found"));

        nodeService.validateCanEdit(step.getNodeId(), userId);

        step.setTitle(dto.title());
        step.setParentStepId(dto.parentStepId());
        step.setDefinitionOfDone(dto.definitionOfDone());
        step.setPrompt(dto.prompt());
        step.setContextNodeIds(dto.contextNodeIds());

        return mapToDto(stepRepository.save(step));
    }

    @Transactional
    public void deleteStep(UUID stepId, UUID userId) {
        RoadmapStep step = stepRepository.findById(stepId)
                .orElseThrow(() -> new com.rochanegra.api.common.exception.ResourceNotFoundException("Step not found"));

        nodeService.validateCanEdit(step.getNodeId(), userId);

        stepRepository.delete(step);
    }

    @Transactional
    public void updateProjectDetails(UUID nodeId, ProjectDetails details, UUID userId) {
        nodeService.validateCanEdit(nodeId, userId);

        ProjectDetails existing = detailsRepository.findById(nodeId)
                .orElseThrow(() -> new com.rochanegra.api.common.exception.ResourceNotFoundException("Project details not found"));
        
        existing.setDesiredOutcome(details.getDesiredOutcome());
        existing.setMainRisk(details.getMainRisk());
        existing.setIsAiEnabled(details.getIsAiEnabled());
        existing.setProgress(details.getProgress());

        detailsRepository.save(existing);
    }

    public ProjectDetails getProjectDetails(UUID nodeId) {
        return detailsRepository.findById(nodeId)
                .orElseThrow(() -> new com.rochanegra.api.common.exception.ResourceNotFoundException("Project details not found"));
    }

    private RoadmapStepDto mapToDto(RoadmapStep step) {
        return new RoadmapStepDto(
                step.getId(),
                step.getNodeId(),
                step.getTitle(),
                step.getStatus(),
                step.getParentStepId(),
                step.getDefinitionOfDone(),
                step.getPrompt(),
                step.getPosition(),
                step.getContextNodeIds()
        );
    }
}
