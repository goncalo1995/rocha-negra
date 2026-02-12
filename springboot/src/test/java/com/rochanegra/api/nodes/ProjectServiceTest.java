package com.rochanegra.api.nodes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.nodes.Node;
import com.rochanegra.api.nodes.NodeMember;
import com.rochanegra.api.nodes.NodeMemberRepository;
import com.rochanegra.api.nodes.NodeRepository;
import com.rochanegra.api.nodes.NodeService;
import com.rochanegra.api.nodes.dto.NodeCreateDto;
import com.rochanegra.api.nodes.dto.NodeDetailDto;
import com.rochanegra.api.nodes.dto.NodeUpdateDto;
import com.rochanegra.api.nodes.types.NodeRole;
import com.rochanegra.api.nodes.types.NodeType;

import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

// This tells JUnit 5 to enable Mockito's annotation support
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    // --- MOCKS ---
    // These are the fake dependencies that NodeService needs.
    @Mock
    private NodeRepository nodeRepository;
    @Mock
    private NodeMemberRepository memberRepository;
    @Mock
    private JdbcTemplate jdbcTemplate;

    // --- CLASS UNDER TEST ---
    // This creates an instance of NodeService and automatically injects the
    // @Mock dependencies into it.
    @InjectMocks
    private NodeService nodeService;

    private UUID mockUserId;
    private NodeCreateDto createDto;

    @BeforeEach
    void setUp() {
        // Set up common variables before each test
        mockUserId = UUID.randomUUID();
        createDto = new NodeCreateDto("Test Project", "A description", NodeType.PROJECT);
    }

    @Test
    void createProject_validRequest_shouldReturnProjectDetailDto() {
        UUID newProjectId = UUID.randomUUID();

        when(jdbcTemplate.queryForObject(
                eq("SELECT create_node_and_add_owner(?, ?, ?, ?)"),
                eq(UUID.class),
                eq(mockUserId), // 1. p_user_id UUID
                eq(NodeType.PROJECT), // 2. p_type ← string! (or "project" if you lowercase it)
                eq("Test Project"), // 3. p_name
                eq("A description") // 4. p_description
        )).thenReturn(newProjectId);

        Node mockProject = new Node();
        mockProject.setId(newProjectId);
        mockProject.setName("Test Project");
        mockProject.setDescription("A description");
        mockProject.setMembers(new ArrayList<>());
        mockProject.setTasks(new ArrayList<>());

        when(nodeRepository.findById(newProjectId)).thenReturn(Optional.of(mockProject));

        NodeDetailDto resultDto = nodeService.createNode(createDto, mockUserId);

        assertNotNull(resultDto);
        assertEquals("Test Project", resultDto.name());
        assertEquals(newProjectId, resultDto.id());

        verify(jdbcTemplate, times(1)).queryForObject(
                eq("SELECT create_node_and_add_owner(?, ?, ?, ?)"),
                eq(UUID.class),
                eq(mockUserId),
                eq(NodeType.PROJECT), // ← must match stub
                eq("Test Project"),
                eq("A description"));
        verify(nodeRepository, times(1)).findById(newProjectId);
    }

    @Test
    void createProject_shouldCallFunctionAndReturnDto() {
        // --- ARRANGE ---
        UUID newProjectId = UUID.randomUUID();
        when(jdbcTemplate.queryForObject(
                eq("SELECT create_node_and_add_owner(?, ?, ?, ?)"),
                eq(UUID.class),
                eq(mockUserId), // 1
                eq(NodeType.PROJECT), // 2 – string representation of NodeType.PROJECT
                eq("Test Project"), // 3
                eq("A description") // 4
        )).thenReturn(newProjectId);

        // --- FIX: SET UP THE MOCK ENTITY COMPLETELY ---
        Node mockProject = new Node();
        mockProject.setId(newProjectId);
        mockProject.setName("Test Project");
        mockProject.setDescription("A description");

        // Create a mock member
        NodeMember mockMember = new NodeMember();
        mockMember.setUserId(mockUserId);
        mockMember.setRole(NodeRole.OWNER);

        // Add the member to the node's list
        mockProject.setMembers(List.of(mockMember));
        // We can leave the tasks list empty for this test
        mockProject.setTasks(List.of());

        when(nodeRepository.findById(newProjectId)).thenReturn(Optional.of(mockProject));

        // --- ACT ---
        NodeDetailDto resultDto = nodeService.createNode(createDto, mockUserId);

        // --- ASSERT ---
        assertNotNull(resultDto);
        assertEquals("Test Project", resultDto.name());
        assertFalse(resultDto.members().isEmpty()); // Verify the member is in the DTO
        assertEquals(mockUserId, resultDto.members().get(0).userId());
        assertEquals("OWNER", resultDto.members().get(0).role());
    }

    @Test
    void getProjectById_found_shouldReturnProjectDetailDto() {
        UUID projectId = UUID.randomUUID();
        Node project = new Node();
        project.setId(projectId);
        project.setName("Existing Project");
        project.setMembers(new ArrayList<>());
        project.setTasks(new ArrayList<>());

        when(nodeRepository.findById(projectId)).thenReturn(Optional.of(project));

        NodeDetailDto result = nodeService.getNodeById(projectId, mockUserId);

        assertNotNull(result);
        assertEquals("Existing Project", result.name());
    }

    @Test
    void getProjectById_notFound_shouldThrowResourceNotFoundException() {
        UUID projectId = UUID.randomUUID();
        when(nodeRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> nodeService.getNodeById(projectId, mockUserId));
    }

    @Test
    void updateProject_validRequest_shouldSaveAndReturnUpdatedDto() {
        UUID projectId = UUID.randomUUID();
        Node existingProject = new Node();
        existingProject.setId(projectId);
        existingProject.setName("Old Name");
        existingProject.setMembers(new ArrayList<>());
        existingProject.setTasks(new ArrayList<>());

        when(nodeRepository.findById(projectId)).thenReturn(Optional.of(existingProject));
        when(nodeRepository.save(any(Node.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NodeUpdateDto updateDto = new NodeUpdateDto("New Name", "New Desc", null, null, null, null, null);
        NodeDetailDto resultDto = nodeService.updateNode(projectId, updateDto, mockUserId);

        assertEquals("New Name", resultDto.name());
        assertEquals("New Desc", resultDto.description());
        verify(nodeRepository).save(existingProject);
    }

    @Test
    void updateProject_notFound_shouldThrowResourceNotFoundException() {
        UUID projectId = UUID.randomUUID();
        NodeUpdateDto updateDto = new NodeUpdateDto("New Name", "New Desc", null, null, null, null, null);
        when(nodeRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> nodeService.updateNode(projectId, updateDto, mockUserId));
    }

    @Test
    void deleteProject_found_shouldCallRepositoryDelete() {
        UUID projectId = UUID.randomUUID();
        Node existingProject = new Node();
        existingProject.setId(projectId);

        when(nodeRepository.findById(projectId)).thenReturn(Optional.of(existingProject));

        nodeService.deleteNode(projectId, mockUserId);

        verify(nodeRepository).delete(existingProject);
    }

    @Test
    void deleteProject_notFound_shouldThrowResourceNotFoundException() {
        UUID projectId = UUID.randomUUID();
        when(nodeRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> nodeService.deleteNode(projectId, mockUserId));
    }
}