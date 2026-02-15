package com.rochanegra.api.tasks;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.rochanegra.api.tasks.dtos.TaskCreateDto;
import com.rochanegra.api.tasks.dtos.TaskDto;
import com.rochanegra.api.tasks.dtos.TaskUpdateDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Endpoint for creating personal/inbox tasks
    @PostMapping
    public ResponseEntity<TaskDto> createPersonalTask(@RequestBody @Valid TaskCreateDto createDto,
            Authentication auth) {
        if (createDto.nodeId() != null) {
            throw new IllegalArgumentException("Use the /nodes/{id}/tasks endpoint to create a task in a node.");
        }
        UUID userId = UUID.fromString(auth.getName());
        return new ResponseEntity<>(taskService.createTask(createDto, userId), HttpStatus.CREATED);
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<TaskDto>> getInbox(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getInboxTasks(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<TaskDto>> getActiveTasks(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getActiveTasks(userId));
    }

    @GetMapping("/today")
    public ResponseEntity<List<TaskDto>> getToday(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getTodayTasks(userId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<TaskDto>> getUpcoming(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getUpcomingTasks(userId));
    }

    @GetMapping("/waiting")
    public ResponseEntity<List<TaskDto>> getWaiting(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getWaitingTasks(userId));
    }

    @GetMapping("/someday")
    public ResponseEntity<List<TaskDto>> getSomeday(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getSomedayTasks(userId));
    }

    @GetMapping
    public ResponseEntity<Page<TaskDto>> getTasks(
            @RequestParam(required = false) UUID nodeId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Integer priority,
            Pageable pageable,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        if (nodeId != null) {
            // Note: Returning a List wrapped in Page or adjusting service to return Page
            // for node tasks too
            // For now let's keep it simple and focus on the 'All' view search
            return ResponseEntity.ok(Page.empty()); // TODO: Implement node paginated if needed
        }
        return ResponseEntity.ok(taskService.searchTasks(userId, q, status, priority, pageable));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable UUID taskId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getTaskById(taskId, userId));
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable UUID taskId, @RequestBody @Valid TaskUpdateDto updateDto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.updateTask(taskId, updateDto, userId));
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable UUID taskId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        taskService.deleteTask(taskId, userId);
    }
}