package com.rochanegra.api.projects;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.rochanegra.api.projects.dto.TaskCreateDto;
import com.rochanegra.api.projects.dto.TaskDto;
import com.rochanegra.api.projects.dto.TaskUpdateDto;

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
        if (createDto.projectId() != null) {
            throw new IllegalArgumentException("Use the /projects/{id}/tasks endpoint to create a task in a project.");
        }
        UUID userId = UUID.fromString(auth.getName());
        return new ResponseEntity<>(taskService.createTask(createDto, userId), HttpStatus.CREATED);
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<TaskDto>> getInbox(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getInboxTasks(userId));
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