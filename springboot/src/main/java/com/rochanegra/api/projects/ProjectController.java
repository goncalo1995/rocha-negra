package com.rochanegra.api.projects;

import com.rochanegra.api.projects.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ProjectDetailDto> createProject(@RequestBody @Valid ProjectCreateDto createDto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        ProjectDetailDto newProject = projectService.createProject(createDto, userId);
        return new ResponseEntity<>(newProject, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProjectSummaryDto>> getMyProjects(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(projectService.getProjectsForUser(userId));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDetailDto> getProjectById(@PathVariable UUID projectId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(projectService.getProjectById(projectId, userId));
    }

    @PatchMapping("/{projectId}")
    public ResponseEntity<ProjectDetailDto> updateProject(@PathVariable UUID projectId,
            @RequestBody @Valid ProjectUpdateDto updateDto, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(projectService.updateProject(projectId, updateDto, userId));
    }

    @DeleteMapping("/{projectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable UUID projectId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        projectService.deleteProject(projectId, userId);
    }

    // --- Member Endpoints ---
    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberDto> addMember(@PathVariable UUID projectId,
            @RequestBody @Valid MemberAddDto addDto, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return new ResponseEntity<>(projectService.addMemberToProject(projectId, addDto, userId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{projectId}/members/{memberUserId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable UUID projectId, @PathVariable UUID memberUserId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        projectService.removeMemberFromProject(projectId, memberUserId, userId);
    }

    // --- Task Endpoints ---
    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<TaskDto> createTaskInProject(@PathVariable UUID projectId,
            @RequestBody @Valid TaskCreateDto createDto, Authentication auth) {
        // Ensure the DTO's projectId matches the path for consistency
        if (!projectId.equals(createDto.projectId())) {
            throw new IllegalArgumentException("Project ID in path does not match body.");
        }
        UUID userId = UUID.fromString(auth.getName());
        return new ResponseEntity<>(taskService.createTask(createDto, userId), HttpStatus.CREATED);
    }
}