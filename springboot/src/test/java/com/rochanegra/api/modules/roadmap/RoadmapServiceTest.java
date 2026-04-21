package com.rochanegra.api.modules.roadmap;

import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.service.NodeService;
import com.rochanegra.api.modules.roadmap.domain.RoadmapStep;
import com.rochanegra.api.modules.roadmap.dto.RoadmapStepCreateDto;
import com.rochanegra.api.modules.roadmap.dto.RoadmapStepDto;
import com.rochanegra.api.modules.roadmap.repository.ProjectDetailsRepository;
import com.rochanegra.api.modules.roadmap.repository.RoadmapStepRepository;
import com.rochanegra.api.modules.roadmap.service.RoadmapService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoadmapServiceTest {

    @Mock
    private RoadmapStepRepository stepRepository;
    @Mock
    private ProjectDetailsRepository detailsRepository;
    @Mock
    private NodeService nodeService;

    @InjectMocks
    private RoadmapService roadmapService;

    private UUID mockNodeId;
    private UUID mockUserId;

    @BeforeEach
    void setUp() {
        mockNodeId = UUID.randomUUID();
        mockUserId = UUID.randomUUID();
    }

    @Test
    void createStep_shouldAssignPositionCorrectly() {
        // Arrange
        RoadmapStepCreateDto dto = new RoadmapStepCreateDto("Sample Step", null, "DOD", "Prompt", Set.of());
        Node mockNode = new Node();
        mockNode.setId(mockNodeId);

        when(nodeService.validateCanEdit(mockNodeId, mockUserId)).thenReturn(mockNode);
        when(stepRepository.findAllByNodeIdOrderByPositionAsc(mockNodeId)).thenReturn(new ArrayList<>());
        
        when(stepRepository.save(any(RoadmapStep.class))).thenAnswer(invocation -> {
            RoadmapStep s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        // Act
        RoadmapStepDto result = roadmapService.createStep(mockNodeId, dto, mockUserId);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("1000"), result.position());
        verify(stepRepository).save(any(RoadmapStep.class));
        verify(nodeService).validateIsProject(mockNode);
    }

    @Test
    void deleteStep_validRequest_shouldCallDelete() {
        // Arrange
        UUID stepId = UUID.randomUUID();
        RoadmapStep step = new RoadmapStep();
        step.setId(stepId);
        step.setNodeId(mockNodeId);
        
        when(stepRepository.findById(stepId)).thenReturn(Optional.of(step));

        // Act
        roadmapService.deleteStep(stepId, mockUserId);

        // Assert
        verify(nodeService).validateCanEdit(mockNodeId, mockUserId);
        verify(stepRepository).delete(step);
    }
}
