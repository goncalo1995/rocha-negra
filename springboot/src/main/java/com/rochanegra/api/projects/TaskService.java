package com.rochanegra.api.projects;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.projects.dto.TaskCreateDto;
import com.rochanegra.api.projects.dto.TaskDto;
import com.rochanegra.api.projects.dto.TaskUpdateDto;
import com.rochanegra.api.projects.types.TaskStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    // We inject repositories directly to avoid circular service dependencies
    private final ProjectRepository projectRepository;

    @Transactional
    public TaskDto createTask(TaskCreateDto createDto, UUID creatorId) {
        Task task = new Task();
        task.setCreatedBy(creatorId);

        if (createDto.projectId() != null) {
            Project project = projectRepository.findById(createDto.projectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            task.setProject(project);
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
        task.setStatus(TaskStatus.todo);

        Task savedTask = taskRepository.save(task);
        return toDto(savedTask);
    }

    public List<TaskDto> getTasksForProject(UUID projectId, UUID userId) {
        // RLS ensures user is a member of the project.
        return taskRepository.findByProjectIdOrderByPositionAsc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getInboxTasks(UUID userId) {
        return taskRepository.findByProjectIdIsNullAndCreatedByOrderByCreatedAtDesc(userId).stream()
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

        if (updateDto.title() != null)
            task.setTitle(updateDto.title());
        if (updateDto.description() != null)
            task.setDescription(updateDto.description());
        if (updateDto.status() != null) {
            if (updateDto.status() == TaskStatus.done) {
                boolean hasIncompleteSubtasks = taskRepository.existsByParentIdAndStatusNot(taskId, TaskStatus.done);
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
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found");
        }
        taskRepository.deleteById(taskId);
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
                task.getProject() != null ? task.getProject().getId() : null,
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