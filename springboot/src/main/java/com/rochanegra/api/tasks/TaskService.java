package com.rochanegra.api.tasks;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import com.rochanegra.api.dashboard.dtos.TasksWidgetDto;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.nodes.Node;
import com.rochanegra.api.nodes.NodeRepository;
import com.rochanegra.api.tasks.dtos.TaskCreateDto;
import com.rochanegra.api.tasks.dtos.TaskDto;
import com.rochanegra.api.tasks.dtos.TaskSummaryDto;
import com.rochanegra.api.tasks.dtos.TaskUpdateDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    // We inject repositories directly to avoid circular service dependencies
    private final NodeRepository projectRepository;

    public TasksWidgetDto getTasksWidget(UUID userId) {

        List<TaskStatus> excluded = List.of(TaskStatus.DONE, TaskStatus.ARCHIVED);
        List<Task> active = taskRepository.findByCreatedByAndStatusNotIn(userId, excluded);

        return new TasksWidgetDto(
                active.size(),
                active.stream()
                        .map(TaskSummaryDto::fromEntity)
                        .toList());
    }

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
            if (parentTask.getStatus() == TaskStatus.DONE) {
                throw new IllegalArgumentException("Cannot add subtask to a completed task.");
            }
            task.setParent(parentTask);
        }

        task.setTitle(createDto.title());
        task.setDescription(createDto.description());
        task.setAssignedTo(createDto.assignedTo());
        task.setDueDate(createDto.dueDate());
        task.setPriority(createDto.priority() != null ? createDto.priority() : 2); // Default priority
        task.setPosition(createDto.position() != null ? createDto.position() : 0); // Default position
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
        // GTD: Inbox is for UNPROCESSED items.
        // Processed items are those with a due date, a project (node), or a non-TODO
        // status.
        return taskRepository.findByNodeIdIsNullAndCreatedByOrderByCreatedAtDesc(userId).stream()
                .filter(task -> task.getDueDate() == null && task.getStatus() == TaskStatus.TODO)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getActiveTasks(UUID userId) {
        List<TaskStatus> excluded = List.of(TaskStatus.DONE, TaskStatus.ARCHIVED);
        return taskRepository.findByCreatedByAndStatusNotIn(userId, excluded).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTodayTasks(UUID userId) {
        return taskRepository.findByCreatedByAndDueDateOrderByPriorityAsc(userId, LocalDate.now()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getUpcomingTasks(UUID userId) {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate nextWeek = LocalDate.now().plusDays(7);
        return taskRepository.findByCreatedByAndDueDateBetweenOrderByDueDateAsc(userId, tomorrow, nextWeek).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getWaitingTasks(UUID userId) {
        return taskRepository.findByCreatedByAndStatusOrderByDueDateAsc(userId, TaskStatus.WAITING).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getSomedayTasks(UUID userId) {
        return taskRepository.findByCreatedByAndStatusOrderByDueDateAsc(userId, TaskStatus.SOMEDAY).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getAllTasksForUser(UUID userId) {
        return taskRepository.findAllByCreatedByOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Page<TaskDto> searchTasks(UUID userId, String query, TaskStatus status, Integer priority,
            Pageable pageable) {
        Specification<Task> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("createdBy"), userId));

            if (query != null && !query.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + query.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return taskRepository.findAll(spec, pageable).map(this::toDto);
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
            if (!node.getMembers().stream().anyMatch(member -> member.getUserId().equals(userId))) {
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
                task.getNode() != null ? task.getNode().getName() : null,
                task.getCreatedAt(),
                task.getUpdatedAt(),
                subtaskDtos);
    }
}