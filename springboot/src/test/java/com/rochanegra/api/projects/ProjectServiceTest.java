package com.rochanegra.api.projects;

import com.rochanegra.api.projects.dto.ProjectCreateDto;
import com.rochanegra.api.projects.dto.ProjectDetailDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Optional;
import java.util.UUID;

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
    void createProject_shouldCallFunctionAndReturnDto() {
        // --- ARRANGE ---
        // 1. Define what our mocks should do when they are called.
        UUID newProjectId = UUID.randomUUID();

        // "When the jdbcTemplate.queryForObject method is called with these exact
        // arguments,
        // then return our predefined newProjectId."
        when(jdbcTemplate.queryForObject(
                "SELECT create_project_and_add_owner(?, ?)",
                UUID.class,
                "Test Project",
                "A description")).thenReturn(newProjectId);

        // 2. We also need to mock what the projectRepository will do when findById is
        // called.
        Project mockProject = new Project(); // Create a fake Project entity
        mockProject.setId(newProjectId);
        mockProject.setName("Test Project");
        mockProject.setDescription("A description");
        mockProject.setDueDate(null);
        // ... set other fields as needed for the toDto() mapper ...

        // "When the projectRepository.findById method is called with our newProjectId,
        // then return an Optional containing our mockProject."
        when(projectRepository.findById(newProjectId)).thenReturn(Optional.of(mockProject));

        // --- ACT ---
        // Call the actual method we are testing.
        ProjectDetailDto resultDto = projectService.createProject(createDto, mockUserId);

        // --- ASSERT ---
        // 3. Verify that the results are what we expect.
        assertNotNull(resultDto);
        assertEquals("Test Project", resultDto.name());
        assertEquals(newProjectId, resultDto.id());

        // 4. (Optional but good practice) Verify that our mocks were called correctly.
        // "Verify that the jdbcTemplate.queryForObject method was called exactly 1 time
        // with the specific arguments we defined."
        verify(jdbcTemplate, times(1)).queryForObject(
                "SELECT create_project_and_add_owner(?, ?)",
                UUID.class,
                "Test Project",
                "A description");
        verify(projectRepository, times(1)).findById(newProjectId);
    }
}