package com.rochanegra.api.modules.tasks;

import com.rochanegra.api.common.exception.ResourceNotFoundException;
import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.repository.NodeRepository;
import com.rochanegra.api.modules.tasks.dtos.TaskCreateDto;
import com.rochanegra.api.modules.tasks.dtos.TaskDto;
import com.rochanegra.api.modules.tasks.dtos.TaskUpdateDto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private NodeRepository nodeRepository;

    @InjectMocks
    private TaskService taskService;

    private UUID userId;
    private UUID nodeId;
    private Node node;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        nodeId = UUID.randomUUID();
        node = new Node();
        node.setId(nodeId);
        node.setName("Test Node");
        node.setMembers(Collections.emptyList()); // Default empty members
    }

    // =================================================================
    // CREATION TESTS (Original)
    // =================================================================

    @Test
    void should_createTaskInProject_when_projectExists() {
        TaskCreateDto createDto = new TaskCreateDto("New Task", "Description", nodeId, null, null, 1, 1, null);
        when(nodeRepository.findById(nodeId)).thenReturn(Optional.of(node));
        mockSavedTask(UUID.randomUUID());

        taskService.createTask(createDto, userId);

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());

        Task savedTask = taskCaptor.getValue();
        assertEquals("New Task", savedTask.getTitle());
        assertEquals(userId, savedTask.getCreatedBy());
        assertNotNull(savedTask.getNode());
    }

    @Test
    void createTask_withParentId_shouldCreateSubtaskAndReturnDto() {
        UUID parentId = UUID.randomUUID();
        Task parentTask = new Task();
        parentTask.setId(parentId);

        when(taskRepository.findById(parentId)).thenReturn(Optional.of(parentTask));
        TaskCreateDto createDto = new TaskCreateDto("Subtask", "Description", nodeId, parentId, null, 1, 1, null);

        when(nodeRepository.findById(nodeId)).thenReturn(Optional.of(node));
        mockSavedTask(UUID.randomUUID());

        TaskDto resultDto = taskService.createTask(createDto, userId);

        assertNotNull(resultDto);
        assertEquals("Subtask", resultDto.title());
        assertEquals(parentId, resultDto.parentId());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTask_nodeNotFound_shouldThrowResourceNotFoundException() {
        TaskCreateDto createDto = new TaskCreateDto("New Task", "Description", nodeId, null, null, 1, 1, null);
        when(nodeRepository.findById(nodeId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.createTask(createDto, userId));
    }

    // =================================================================
    // UPDATE & STATUS TESTS
    // =================================================================

    @Test
    void updateTask_markAsDone_shouldSetCompletedAt_ifNoSubtasks() {
        UUID taskId = UUID.randomUUID();
        Task existingTask = new Task();
        existingTask.setId(taskId);
        existingTask.setStatus(TaskStatus.TODO);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.existsByParentIdAndStatusNot(taskId, TaskStatus.DONE)).thenReturn(false);
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, null, null, TaskStatus.DONE, null, null, null);

        TaskDto resultDto = taskService.updateTask(taskId, updateDto, userId);

        assertEquals(TaskStatus.DONE, resultDto.status());
        assertNotNull(resultDto.completedAt());
    }

    @Test
    void updateTask_toDone_ShouldThrow_ifHasIncompleteSubtasks() {
        UUID taskId = UUID.randomUUID();
        Task task = new Task();
        task.setId(taskId);
        task.setStatus(TaskStatus.TODO);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(taskRepository.existsByParentIdAndStatusNot(taskId, TaskStatus.DONE)).thenReturn(true);

        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, null, null, TaskStatus.DONE, null, null, null);

        assertThrows(IllegalArgumentException.class, () -> taskService.updateTask(taskId, updateDto, userId));
    }

    @Test
    void createTask_withDoneParent_ShouldThrowException() {
        UUID parentId = UUID.randomUUID();
        Task parentTask = new Task();
        parentTask.setId(parentId);
        parentTask.setStatus(TaskStatus.DONE);

        when(nodeRepository.findById(nodeId)).thenReturn(Optional.of(node));
        when(taskRepository.findById(parentId)).thenReturn(Optional.of(parentTask));
        TaskCreateDto createDto = new TaskCreateDto("Subtask", "Description", nodeId, parentId, null, 1, 1, null);

        assertThrows(IllegalArgumentException.class, () -> taskService.createTask(createDto, userId));
    }

    @Test
    void updateTask_toWaiting_ShouldSucceed() {
        UUID taskId = UUID.randomUUID();
        Task task = new Task();
        task.setId(taskId);
        task.setStatus(TaskStatus.TODO);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, null, null, TaskStatus.WAITING, null, null, null);

        TaskDto result = taskService.updateTask(taskId, updateDto, userId);

        assertEquals(TaskStatus.WAITING, result.status());
    }

    @Test
    void updateTask_taskNotFound_shouldThrowResourceNotFoundException() {
        UUID taskId = UUID.randomUUID();
        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, null, null, TaskStatus.DONE, null, null, null);
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.updateTask(taskId, updateDto, userId));
    }

    @Test
    void getTaskById_taskNotFound_shouldThrowResourceNotFoundException() {
        UUID taskId = UUID.randomUUID();
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(taskId, userId));
    }

    @Test
    void should_clearCompletedAt_when_taskIsMarkedAsNotDone() {
        // Arrange
        UUID taskId = UUID.randomUUID();
        Task existingTask = new Task();
        existingTask.setId(taskId);
        existingTask.setStatus(TaskStatus.DONE);
        existingTask.setCompletedAt(Instant.now()); // It has a completion date

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskUpdateDto updateDto = new TaskUpdateDto(null, null, null, null, null, TaskStatus.IN_PROGRESS, null, null,
                null);

        // Act
        TaskDto resultDto = taskService.updateTask(taskId, updateDto, userId);

        // Assert
        assertEquals(TaskStatus.IN_PROGRESS, resultDto.status());
        assertNull(resultDto.completedAt()); // Verify the completion date was cleared
    }

    // =================================================================
    // GTD & SEARCH TESTS
    // =================================================================

    @Test
    void getInboxTasks_ShouldOnlyReturnUnprocessedTasks() {
        Task unprocessed = new Task();
        unprocessed.setTitle("Unprocessed");
        unprocessed.setStatus(TaskStatus.TODO);
        unprocessed.setCreatedBy(userId);

        Task withDueDate = new Task();
        withDueDate.setTitle("With Due Date");
        withDueDate.setDueDate(LocalDate.now());
        withDueDate.setStatus(TaskStatus.TODO);
        withDueDate.setCreatedBy(userId);

        Task done = new Task();
        done.setTitle("Done");
        done.setStatus(TaskStatus.DONE);
        done.setCreatedBy(userId);

        when(taskRepository.findByNodeIdIsNullAndCreatedByOrderByCreatedAtDesc(userId))
                .thenReturn(Arrays.asList(unprocessed, withDueDate, done));

        List<TaskDto> result = taskService.getInboxTasks(userId);

        assertEquals(1, result.size());
        assertEquals("Unprocessed", result.get(0).title());
    }

    @Test
    @SuppressWarnings("unchecked")
    void searchTasks_ShouldApplyFiltersAndPagination() {
        Pageable pageable = PageRequest.of(0, 10);
        Task task = new Task();
        task.setTitle("Search Result");
        Page<Task> page = new PageImpl<>(Collections.singletonList(task));

        when(taskRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<TaskDto> result = taskService.searchTasks(userId, "Search", TaskStatus.TODO, 1, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Search Result", result.getContent().get(0).title());
    }

    // =================================================================
    // HELPERS
    // =================================================================

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
