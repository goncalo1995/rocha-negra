package com.rochanegra.api.blueprint;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.rochanegra.api.modules.blueprint.domain.BlueprintStep;
import com.rochanegra.api.modules.blueprint.repository.BlueprintStepRepository;
import com.rochanegra.api.modules.blueprint.service.BlueprintService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BlueprintServiceTest {

    @Mock
    private BlueprintStepRepository repository;

    @InjectMocks
    private BlueprintService blueprintService;

    @Test
    public void testReorderSteps() {
        UUID parentId = UUID.randomUUID();
        UUID stepId1 = UUID.randomUUID();
        UUID stepId2 = UUID.randomUUID();
        List<UUID> orderedIds = List.of(stepId1, stepId2);

        BlueprintStep step1 = new BlueprintStep();
        step1.setId(stepId1);
        BlueprintStep step2 = new BlueprintStep();
        step2.setId(stepId2);

        BlueprintStep parent = new BlueprintStep();
        parent.setId(parentId);

        when(repository.findById(stepId1)).thenReturn(Optional.of(step1));
        when(repository.findById(stepId2)).thenReturn(Optional.of(step2));
        when(repository.findById(parentId)).thenReturn(Optional.of(parent));

        blueprintService.reorderSteps(parentId, orderedIds);

        assertEquals(0, step1.getPosition());
        assertEquals(1, step2.getPosition());
        assertEquals(parentId, step1.getParent().getId());
        assertEquals(parentId, step2.getParent().getId());

        verify(repository, times(2)).save(any(BlueprintStep.class));
    }
}
