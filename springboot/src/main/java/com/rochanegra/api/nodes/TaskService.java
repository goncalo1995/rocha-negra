package com.rochanegra.api.nodes;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.nodes.dto.TaskCreateDto;
import com.rochanegra.api.nodes.dto.TaskDto;
import com.rochanegra.api.nodes.dto.TaskUpdateDto;
import com.rochanegra.api.nodes.types.TaskStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    // We inject repositories directly to avoid circular service dependencies
    private final NodeRepository projectRepository;

    @Transactional
    public TaskDto createTask(TaskCreateDto createDto, UUID creatorId) {
        Task task = new Task();
        task.setCreatedBy(creatorId);

        if (createDto.nodeId() != null) {
            Node node = projectRepository.findById(createDto.nodeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Node not found"));
            task.setNode(node);
        }

        if (createDto.parentId() != null) {
            Task parentTask = taskRepository.findById(createDto.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent task not found"));
            task.setParent(parentTask);
        }

        task.setTitle(createDto.title());
        task.setDescription(createDto.description());
        task.setAssignedTo(createDto.assignedTo());
        task.setDueDate(createDto.dueDate());
        task.setPriority(createDto.priority() != null ? createDto.priority() : 2); // Default priority
        task.setStatus(TaskStatus.TODO);

        Task savedTask = taskRepository.save(task);
        return toDto(savedTask);
    }

    public List<TaskDto> getTasksForNode(UUID nodeId, UUID userId) {
        // RLS ensures user is a member of the project.
        return taskRepository.findByNodeIdOrderByPositionAsc(nodeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getInboxTasks(UUID userId) {
        return taskRepository.findByNodeIdIsNullAndCreatedByOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getActiveTasks(UUID userId) {
        List<TaskStatus> excluded = List.of(TaskStatus.DONE, TaskStatus.ARCHIVED);
        List<Task> tasks = taskRepository.findByCreatedByAndStatusNotIn(userId, excluded);
        // By due date is common for a dashboard.
        tasks.sort(Comparator.comparing(Task::getDueDate, Comparator.nullsLast(Comparator.naturalOrder())));
        return tasks.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getAllTasksForUser(UUID userId) {
        return taskRepository.findAllByCreatedByOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto getTaskById(UUID taskId, UUID userId) {
        // RLS protects this query.
        // We can use a more advanced query to fetch the entire tree, but for now,
        // JPA's lazy loading will handle fetching immediate children when needed.
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return toDto(task);
    }

    @Transactional
    public TaskDto updateTask(UUID taskId, TaskUpdateDto updateDto, UUID userId) {
        // RLS ensures user has permission to update this task.
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (updateDto.nodeId() != null) {
            Node node = projectRepository.findById(updateDto.nodeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Node not found"));
            if (!node.getMembers().stream().anyMatch(member -> member.getId().equals(userId))) {
                throw new IllegalArgumentException("User is not a member of the node");
            }
            task.setNode(node);
        }
        if (updateDto.parentId() != null) {
            Task parentTask = taskRepository.findById(updateDto.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent task not found"));
            if (parentTask.getNode() != null && !parentTask.getNode().equals(task.getNode())) {
                throw new IllegalArgumentException("Parent task must be in the same node as the task");
            }
            task.setParent(parentTask);
        }

        if (updateDto.title() != null)
            task.setTitle(updateDto.title());
        if (updateDto.description() != null)
            task.setDescription(updateDto.description());
        if (updateDto.status() != null) {
            if (updateDto.status() == TaskStatus.DONE) {
                boolean hasIncompleteSubtasks = taskRepository.existsByParentIdAndStatusNot(taskId, TaskStatus.DONE);
                if (hasIncompleteSubtasks) {
                    throw new IllegalArgumentException("Cannot mark task as done because it has incomplete subtasks.");
                }
                task.setCompletedAt(Instant.now());
            } else {
                task.setCompletedAt(null);
            }
            task.setStatus(updateDto.status());
        }
        if (updateDto.assignedTo() != null)
            task.setAssignedTo(updateDto.assignedTo());
        if (updateDto.dueDate() != null)
            task.setDueDate(updateDto.dueDate());
        if (updateDto.priority() != null)
            task.setPriority(updateDto.priority());
        if (updateDto.position() != null)
            task.setPosition(updateDto.position());

        Task savedTask = taskRepository.save(task);
        return toDto(savedTask);
    }

    public void deleteTask(UUID taskId, UUID userId) {
        // RLS ensures user has permission (is owner or creator of personal task).
        Task taskToDelete = taskRepository.findByIdAndCreatedBy(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found or user not authorized"));
        taskRepository.delete(taskToDelete);
    }

    // You will need to create a TaskDto record and this mapper
    private TaskDto toDto(Task task) {
        if (task == null)
            return null;

        // Recursively map all sub-tasks
        List<TaskDto> subtaskDtos = task.getSubtasks()
                .stream()
                .map(this::toDto) // The recursive call
                .collect(Collectors.toList());

        return new TaskDto(
                task.getId(),
                task.getNode() != null ? task.getNode().getId() : null,
                task.getParent() != null ? task.getParent().getId() : null,
                task.getCreatedBy(),
                task.getAssignedTo(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCompletedAt(),
                task.getPosition(),
                task.getCustomFields(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                subtaskDtos);
    }
}