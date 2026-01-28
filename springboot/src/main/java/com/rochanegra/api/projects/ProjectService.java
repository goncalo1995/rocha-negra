package com.rochanegra.api.projects;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.projects.dto.MemberAddDto;
import com.rochanegra.api.projects.dto.ProjectCreateDto;
import com.rochanegra.api.projects.dto.ProjectDetailDto;
import com.rochanegra.api.projects.dto.ProjectMemberDto;
import com.rochanegra.api.projects.dto.ProjectSummaryDto;
import com.rochanegra.api.projects.dto.ProjectUpdateDto;
import com.rochanegra.api.projects.dto.TaskSummaryDto;
import com.rochanegra.api.projects.types.ProjectRole;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public ProjectDetailDto createProject(ProjectCreateDto createDto, UUID userId) {
        String sql = "SELECT create_project_and_add_owner(?, ?, ?)";
        UUID newProjectId = jdbcTemplate.queryForObject(sql, UUID.class, createDto.name(), createDto.description(),
                userId);

        return getProjectById(newProjectId, userId);
    }

    public List<ProjectSummaryDto> getProjectsForUser(UUID userId) {
        List<Project> projects = projectRepository.findProjectsByMember(userId);
        return projects.stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    public ProjectDetailDto getProjectById(UUID projectId, UUID userId) {
        // Your RLS policy already ensures the user is a member, but an extra check in
        // the service is good practice.
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return toDetailDto(project);
    }

    @Transactional
    public ProjectDetailDto updateProject(UUID projectId, ProjectUpdateDto updateDto, UUID userId) {
        // RLS will ensure user is an owner/editor before this code is even reached.
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (updateDto.name() != null)
            project.setName(updateDto.name());
        if (updateDto.description() != null)
            project.setDescription(updateDto.description());
        if (updateDto.status() != null)
            project.setStatus(updateDto.status());
        if (updateDto.dueDate() != null)
            project.setDueDate(updateDto.dueDate());

        Project savedProject = projectRepository.save(project);
        return toDetailDto(savedProject); // Return the full, updated object
    }

    @Transactional
    public ProjectMemberDto addMemberToProject(UUID projectId, MemberAddDto addDto, UUID userId) {
        // RLS ensures only owners can call this.
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Prevent adding a duplicate member
        if (memberRepository.findByProjectIdAndUserId(projectId, addDto.userId()).isPresent()) {
            throw new IllegalStateException("User is already a member of this project.");
        }

        ProjectMember newMember = new ProjectMember();
        newMember.setProject(project);
        newMember.setUserId(addDto.userId());
        newMember.setRole(addDto.role());

        ProjectMember savedMember = memberRepository.save(newMember);
        return new ProjectMemberDto(savedMember.getUserId(), savedMember.getRole().toString());
    }

    @Transactional
    public void removeMemberFromProject(UUID projectId, UUID memberUserId, UUID currentUserId) {
        // RLS ensures only owners can call this.
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this project"));

        // Business Rule: Owner cannot remove themselves if they are the last owner.
        if (member.getRole() == ProjectRole.owner && projectRepository.countOwners(projectId) <= 1) {
            throw new IllegalStateException("Cannot remove the last owner of a project.");
        }

        memberRepository.delete(member);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId) {
        // RLS ensures only owners can delete.
        // We might want to check roles here explicitly for clarity, but database rules
        // should handle it.
        // For safety, let's verify existence.
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectRepository.delete(project);
    }

    // --- Mapper Methods ---

    private ProjectSummaryDto toSummaryDto(Project project) {
        return new ProjectSummaryDto(
                project.getId(),
                project.getName(),
                project.getStatus(),
                project.getDueDate(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                project.getMembers().size(),
                project.getTasks().size());
    }

    private ProjectDetailDto toDetailDto(Project project) {
        List<ProjectMemberDto> members = project.getMembers().stream()
                .map(m -> new ProjectMemberDto(m.getUserId(), m.getRole().toString()))
                .collect(Collectors.toList());

        List<TaskSummaryDto> tasks = project.getTasks().stream()
                .map(t -> new TaskSummaryDto(t.getId(), t.getTitle(), t.getStatus().toString(), t.getDueDate()))
                .collect(Collectors.toList());

        return new ProjectDetailDto(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getDueDate(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                members,
                tasks);
    }
}