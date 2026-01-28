package com.rochanegra.api.projects;

import com.rochanegra.api.projects.dto.ProjectUpdateDto;
import com.rochanegra.api.projects.dto.ProjectCreateDto;
import com.rochanegra.api.projects.dto.ProjectDetailDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import com.rochanegra.api.exception.ResourceNotFoundException;

import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// This tells JUnit 5 to enable Mockito's annotation support
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    // --- MOCKS ---
    // These are the fake dependencies that ProjectService needs.
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProjectMemberRepository memberRepository;
    @Mock
    private JdbcTemplate jdbcTemplate;

    // --- CLASS UNDER TEST ---
    // This creates an instance of ProjectService and automatically injects the
    // @Mock dependencies into it.
    @InjectMocks
    private ProjectService projectService;

    private UUID mockUserId;
    private ProjectCreateDto createDto;

    @BeforeEach
    void setUp() {
        // Set up common variables before each test
        mockUserId = UUID.randomUUID();
        createDto = new ProjectCreateDto("Test Project", "A description");
    }

    @Test
    void createProject_validRequest_shouldReturnProjectDetailDto() {
        UUID newProjectId = UUID.randomUUID();

        when(jdbcTemplate.queryForObject(
                eq("SELECT create_project_and_add_owner(?, ?, ?)"),
                eq(UUID.class),
                eq("Test Project"),
                eq("A description"),
                eq(mockUserId))).thenReturn(newProjectId);

        Project mockProject = new Project();
        mockProject.setId(newProjectId);
        mockProject.setName("Test Project");
        mockProject.setDescription("A description");
        mockProject.setMembers(new ArrayList<>());
        mockProject.setTasks(new ArrayList<>());

        when(projectRepository.findById(newProjectId)).thenReturn(Optional.of(mockProject));

        ProjectDetailDto resultDto = projectService.createProject(createDto, mockUserId);

        assertNotNull(resultDto);
        assertEquals("Test Project", resultDto.name());
        assertEquals(newProjectId, resultDto.id());

        verify(jdbcTemplate, times(1)).queryForObject(
                eq("SELECT create_project_and_add_owner(?, ?, ?)"),
                eq(UUID.class),
                eq("Test Project"),
                eq("A description"),
                eq(mockUserId));
        verify(projectRepository, times(1)).findById(newProjectId);
    }

    @Test
    void getProjectById_found_shouldReturnProjectDetailDto() {
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        project.setId(projectId);
        project.setName("Existing Project");
        project.setMembers(new ArrayList<>());
        project.setTasks(new ArrayList<>());

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        ProjectDetailDto result = projectService.getProjectById(projectId, mockUserId);

        assertNotNull(result);
        assertEquals("Existing Project", result.name());
    }

    @Test
    void getProjectById_notFound_shouldThrowResourceNotFoundException() {
        UUID projectId = UUID.randomUUID();
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.getProjectById(projectId, mockUserId));
    }

    @Test
    void updateProject_validRequest_shouldSaveAndReturnUpdatedDto() {
        UUID projectId = UUID.randomUUID();
        Project existingProject = new Project();
        existingProject.setId(projectId);
        existingProject.setName("Old Name");
        existingProject.setMembers(new ArrayList<>());
        existingProject.setTasks(new ArrayList<>());

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(existingProject));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectUpdateDto updateDto = new ProjectUpdateDto("New Name", "New Desc", null, null);
        ProjectDetailDto resultDto = projectService.updateProject(projectId, updateDto, mockUserId);

        assertEquals("New Name", resultDto.name());
        assertEquals("New Desc", resultDto.description());
        verify(projectRepository).save(existingProject);
    }

    @Test
    void updateProject_notFound_shouldThrowResourceNotFoundException() {
        UUID projectId = UUID.randomUUID();
        ProjectUpdateDto updateDto = new ProjectUpdateDto("New Name", null, null, null);
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> projectService.updateProject(projectId, updateDto, mockUserId));
    }

    @Test
    void deleteProject_found_shouldCallRepositoryDelete() {
        UUID projectId = UUID.randomUUID();
        Project existingProject = new Project();
        existingProject.setId(projectId);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(existingProject));

        projectService.deleteProject(projectId, mockUserId);

        verify(projectRepository).delete(existingProject);
    }

    @Test
    void deleteProject_notFound_shouldThrowResourceNotFoundException() {
        UUID projectId = UUID.randomUUID();
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.deleteProject(projectId, mockUserId));
    }
}