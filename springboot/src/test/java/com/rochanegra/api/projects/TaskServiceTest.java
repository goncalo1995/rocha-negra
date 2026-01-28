package com.rochanegra.api.projects;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.projects.dto.TaskCreateDto;
import com.rochanegra.api.projects.dto.TaskDto;
import com.rochanegra.api.projects.dto.TaskUpdateDto;
import com.rochanegra.api.projects.types.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private TaskService taskService;

    private UUID creatorId;
    private UUID projectId;
    private Project project;

    @BeforeEach
    void setUp() {
        creatorId = UUID.randomUUID();
        projectId = UUID.randomUUID();
        project = new Project();
        project.setId(projectId);
        project.setName("Test Project");
    }

    @Test
    void should_createTaskInProject_when_projectExists() {
        // Arrange
        TaskCreateDto createDto = new TaskCreateDto("New Task", "Description", projectId, null, null, 1, null);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        mockSavedTask(UUID.randomUUID());

        // Act
        TaskDto resultDto = taskService.createTask(createDto, creatorId);

        // Assert
        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());

        Task savedTask = taskCaptor.getValue();
        assertEquals("New Task", savedTask.getTitle());
        assertEquals(creatorId, savedTask.getCreatedBy());
        assertNotNull(savedTask.getProject());
    }

    @Test
    void createTask_validRequest_shouldReturnTaskDto() {
        TaskCreateDto createDto = new TaskCreateDto("New Task", "Description", projectId, null, null, 1, null);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        mockSavedTask(UUID.randomUUID());

        TaskDto resultDto = taskService.createTask(createDto, creatorId);

        assertNotNull(resultDto);
        assertEquals("New Task", resultDto.title());
        assertEquals(projectId, resultDto.projectId());
        assertEquals(TaskStatus.todo, resultDto.status());
        assertEquals(1, resultDto.priority());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_withParentId_shouldCreateSubtaskAndReturnDto() {
        UUID parentId = UUID.randomUUID();
        Task parentTask = new Task();
        parentTask.setId(parentId);

        when(taskRepository.findById(parentId)).thenReturn(Optional.of(parentTask));
        TaskCreateDto createDto = new TaskCreateDto("Subtask", "Description", projectId, parentId, null, 1, null);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        mockSavedTask(UUID.randomUUID());

        TaskDto resultDto = taskService.createTask(createDto, creatorId);

        assertNotNull(resultDto);
        assertEquals("Subtask", resultDto.title());
        assertEquals(parentId, resultDto.parentId());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_projectNotFound_shouldThrowResourceNotFoundException() {
        TaskCreateDto createDto = new TaskCreateDto("New Task", "Description", projectId, null, null, 1, null);
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.createTask(createDto, creatorId));
    }

    @Test
    void updateTask_markAsDone_shouldSetCompletedAt() {
        UUID taskId = UUID.randomUUID();
        Task existingTask = new Task();
        existingTask.setId(taskId);
        existingTask.setStatus(TaskStatus.todo);
        existingTask.setTitle("Old Title");

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, TaskStatus.done, null, null, null);

        Instant beforeUpdate = Instant.now();
        TaskDto resultDto = taskService.updateTask(taskId, updateDto, creatorId);
        Instant afterUpdate = Instant.now();

        assertEquals(TaskStatus.done, resultDto.status());
        assertNotNull(resultDto.completedAt());
        assertTrue(!resultDto.completedAt().isBefore(beforeUpdate) && !resultDto.completedAt().isAfter(afterUpdate));
        verify(taskRepository).save(existingTask);
    }

    @Test
    void updateTask_taskNotFound_shouldThrowResourceNotFoundException() {
        UUID taskId = UUID.randomUUID();
        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, TaskStatus.done, null, null, null);
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.updateTask(taskId, updateDto, creatorId));
    }

    @Test
    void getTaskById_taskNotFound_shouldThrowResourceNotFoundException() {
        UUID taskId = UUID.randomUUID();
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(taskId, creatorId));
    }

    @Test
    void should_clearCompletedAt_when_taskIsMarkedAsNotDone() {
        // Arrange
        UUID taskId = UUID.randomUUID();
        Task existingTask = new Task();
        existingTask.setId(taskId);
        existingTask.setStatus(TaskStatus.done);
        existingTask.setCompletedAt(Instant.now()); // It has a completion date

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, TaskStatus.in_progress, null, null, null);

        // Act
        TaskDto resultDto = taskService.updateTask(taskId, updateDto, creatorId);

        // Assert
        assertEquals(TaskStatus.in_progress, resultDto.status());
        assertNull(resultDto.completedAt()); // Verify the completion date was cleared
    }

    private void mockSavedTask(UUID taskId) {
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            if (task.getId() == null) {
                task.setId(taskId);
            }
            return task;
        });
    }
}
