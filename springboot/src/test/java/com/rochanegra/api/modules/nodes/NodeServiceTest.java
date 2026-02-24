package com.rochanegra.api.modules.nodes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import com.rochanegra.api.common.exception.ResourceNotFoundException;
import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.domain.NodeMember;
import com.rochanegra.api.modules.nodes.dto.NodeCreateDto;
import com.rochanegra.api.modules.nodes.dto.NodeDetailDto;
import com.rochanegra.api.modules.nodes.dto.NodeUpdateDto;
import com.rochanegra.api.modules.nodes.repository.NodeLinkRepository;
import com.rochanegra.api.modules.nodes.repository.NodeMemberRepository;
import com.rochanegra.api.modules.nodes.repository.NodeRepository;
import com.rochanegra.api.modules.nodes.service.NodeService;
import com.rochanegra.api.modules.nodes.types.NodeRole;
import com.rochanegra.api.modules.nodes.types.NodeStatus;
import com.rochanegra.api.modules.nodes.types.NodeType;

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
class NodeServiceTest {

    // --- MOCKS ---
    // These are the fake dependencies that NodeService needs.
    @Mock
    private NodeRepository nodeRepository;
    @Mock
    private NodeMemberRepository memberRepository;
    @Mock
    private NodeLinkRepository linkRepository;
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
        createDto = new NodeCreateDto("Test Project", "A description", NodeType.PROJECT, NodeStatus.ACTIVE, null, null);
    }

    // --- CREATE TESTS ---
    @Test
    void createNode_shouldCallFunctionAndReturnCorrectlyMappedDto() {
        // Arrange
        UUID newNodeId = UUID.randomUUID();

        // We use 'eq()' for specific values and 'any()' for types we don't care to
        // match exactly.
        // However, it's best to be as specific as possible.
        when(jdbcTemplate.queryForObject(
                eq("SELECT create_node_and_add_owner(?, ?::node_type, ?, ?, ?, ?, ?::node_status)"),
                eq(UUID.class), // Expect this exact class
                eq(mockUserId), // Expect the mock user's ID
                eq("PROJECT"), // Expect the string "PROJECT"
                eq(createDto.name()), // Expect the name from the DTO
                eq(createDto.description()), // Expect the description from the DTO
                eq(createDto.parentId()), // Expect the parent ID from the DTO
                eq(createDto.dueDate()), // Expect the due date from the DTO
                eq("ACTIVE") // Expect the string "ACTIVE"
        )).thenReturn(newNodeId);

        // This is the complete entity that findById should return
        Node mockNode = new Node();
        mockNode.setId(newNodeId);
        mockNode.setName("Test Project");
        mockNode.setDescription("A description");
        mockNode.setType(NodeType.PROJECT);
        mockNode.setDueDate(createDto.dueDate());
        mockNode.setUserId(mockUserId); // Important for RLS check tests

        // Mock the relationships that the DTO mapper needs
        NodeMember mockMember = new NodeMember();
        mockMember.setUserId(mockUserId);
        mockMember.setRole(NodeRole.OWNER);
        mockNode.setMembers(List.of(mockMember));
        mockNode.setTasks(new ArrayList<>());
        mockNode.setChildren(new ArrayList<>());

        when(nodeRepository.findById(newNodeId)).thenReturn(Optional.of(mockNode));

        // Act
        NodeDetailDto resultDto = nodeService.createNode(createDto, mockUserId);

        // Assert
        assertNotNull(resultDto);
        assertEquals(newNodeId, resultDto.id());
        assertEquals("Test Project", resultDto.name());
        assertEquals(NodeType.PROJECT, resultDto.type());
        assertEquals(NodeStatus.ACTIVE, resultDto.status());
        assertEquals(createDto.parentId(), resultDto.parentId());
        assertEquals(createDto.dueDate(), resultDto.dueDate());
        assertEquals(1, resultDto.members().size());
        assertEquals(mockUserId, resultDto.members().get(0).userId());

        // Verify the DB function was called correctly
        verify(jdbcTemplate).queryForObject(
                eq("SELECT create_node_and_add_owner(?, ?::node_type, ?, ?, ?, ?, ?::node_status)"),
                eq(UUID.class),
                eq(mockUserId),
                eq("PROJECT"),
                eq("Test Project"),
                eq("A description"),
                eq(createDto.parentId()),
                eq(createDto.dueDate()),
                eq("ACTIVE"));
    }

    @Test
    void createProject_validRequest_shouldReturnProjectDetailDto() {
        UUID newProjectId = UUID.randomUUID();

        when(jdbcTemplate.queryForObject(
                eq("SELECT create_node_and_add_owner(?, ?::node_type, ?, ?, ?, ?, ?::node_status)"),
                eq(UUID.class),
                eq(mockUserId), // 1. p_user_id UUID
                eq("PROJECT"), // 2. p_type ← string
                eq("Test Project"), // 3. p_name
                eq("A description"), // 4. p_description
                eq(createDto.parentId()), // 5. p_parent_id UUID
                eq(createDto.dueDate()), // 6. p_due_date DATE
                eq("ACTIVE") // 7. p_status ← string
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
                eq("SELECT create_node_and_add_owner(?, ?::node_type, ?, ?, ?, ?, ?::node_status)"),
                eq(UUID.class),
                eq(mockUserId),
                eq("PROJECT"), // ← must match stub
                eq("Test Project"),
                eq("A description"),
                eq(createDto.parentId()),
                eq(createDto.dueDate()),
                eq("ACTIVE"));
        verify(nodeRepository, times(1)).findById(newProjectId);
    }

    @Test
    void createProject_shouldCallFunctionAndReturnDto() {
        // --- ARRANGE ---
        UUID newProjectId = UUID.randomUUID();
        when(jdbcTemplate.queryForObject(
                eq("SELECT create_node_and_add_owner(?, ?::node_type, ?, ?, ?, ?, ?::node_status)"),
                eq(UUID.class),
                eq(mockUserId), // 1
                eq("PROJECT"), // 2 – string representation of NodeType.PROJECT
                eq("Test Project"), // 3
                eq("A description"), // 4
                eq(createDto.parentId()), // 5
                eq(createDto.dueDate()), // 6
                eq("ACTIVE") // 7
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

    // --- GET BY ID TESTS ---
    @Test
    void getNodeById_shouldReturnDetailDtoWithChildrenSummaries() {
        // Arrange
        UUID nodeId = UUID.randomUUID();
        Node parentNode = new Node();
        parentNode.setId(nodeId);
        parentNode.setUserId(mockUserId);
        parentNode.setTasks(new ArrayList<>());
        parentNode.setMembers(new ArrayList<>());

        Node childNode = new Node();
        childNode.setId(UUID.randomUUID());
        childNode.setName("Child Project");
        childNode.setTasks(new ArrayList<>()); // Child has its own tasks
        childNode.setMembers(new ArrayList<>());

        parentNode.setChildren(List.of(childNode));

        when(nodeRepository.findById(nodeId)).thenReturn(Optional.of(parentNode));

        // Act
        NodeDetailDto result = nodeService.getNodeById(nodeId, mockUserId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.children().size());
        assertEquals("Child Project", result.children().get(0).name());
        // Verify it's a summary DTO by checking for a summary-only field
        assertEquals(0, result.children().get(0).taskCount());
    }

    @Test
    void getNodeById_whenNodeNotFound_shouldThrowResourceNotFoundException() {
        UUID nodeId = UUID.randomUUID();
        when(nodeRepository.findById(nodeId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            nodeService.getNodeById(nodeId, mockUserId);
        });
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

    // --- UPDATE TESTS (EDGE CASES) ---
    @Test
    void updateNode_toReparent_shouldSucceed() {
        // Arrange
        UUID childId = UUID.randomUUID();
        UUID newParentId = UUID.randomUUID();
        Node childNode = new Node();
        childNode.setId(childId);
        childNode.setUserId(mockUserId);

        Node parentNode = new Node();
        parentNode.setId(newParentId);
        parentNode.setUserId(mockUserId);

        when(nodeRepository.findById(childId)).thenReturn(Optional.of(childNode));
        when(nodeRepository.findById(newParentId)).thenReturn(Optional.of(parentNode));
        when(nodeRepository.save(any(Node.class))).thenReturn(childNode); // Return the modified node

        NodeUpdateDto updateDto = new NodeUpdateDto(null, null, null, null, null, null, null, newParentId);

        // Act
        nodeService.updateNode(childId, updateDto, mockUserId);

        // Assert
        ArgumentCaptor<Node> nodeCaptor = ArgumentCaptor.forClass(Node.class);
        verify(nodeRepository).save(nodeCaptor.capture());

        Node savedNode = nodeCaptor.getValue();
        assertNotNull(savedNode.getParent());
        assertEquals(newParentId, savedNode.getParent().getId());
    }

    @Test
    void updateNode_toBecomeItsOwnParent_shouldThrowException() {
        // Arrange
        UUID nodeId = UUID.randomUUID();
        Node node = new Node();
        node.setId(nodeId);
        node.setUserId(mockUserId);

        when(nodeRepository.findById(nodeId)).thenReturn(Optional.of(node));

        NodeUpdateDto updateDto = new NodeUpdateDto(null, null, null, null, null, null, null, nodeId); // Trying to set
                                                                                                       // self as parent
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            nodeService.updateNode(nodeId, updateDto, mockUserId);
        });
        verify(nodeRepository, never()).save(any());
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

        NodeUpdateDto updateDto = new NodeUpdateDto("New Name", "New Desc", null, null, null, null, null, null);
        NodeDetailDto resultDto = nodeService.updateNode(projectId, updateDto, mockUserId);

        assertEquals("New Name", resultDto.name());
        assertEquals("New Desc", resultDto.description());
        verify(nodeRepository).save(existingProject);
    }

    @Test
    void updateProject_notFound_shouldThrowResourceNotFoundException() {
        UUID projectId = UUID.randomUUID();
        NodeUpdateDto updateDto = new NodeUpdateDto("New Name", "New Desc", null, null, null, null, null, null);
        when(nodeRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> nodeService.updateNode(projectId, updateDto, mockUserId));
    }

    @Test
    void deleteProject_found_shouldCallRepositoryDelete() {
        UUID projectId = UUID.randomUUID();

        Node existingProject = new Node();
        existingProject.setId(projectId);
        existingProject.setUserId(mockUserId);
        existingProject.setMembers(new ArrayList<>());

        NodeMember member = new NodeMember();
        member.setUserId(mockUserId);
        member.setNode(existingProject);
        member.setRole(NodeRole.OWNER);

        existingProject.getMembers().add(member);

        when(nodeRepository.findById(projectId)).thenReturn(Optional.of(existingProject));
        when(memberRepository.findByNodeIdAndUserId(projectId, mockUserId))
                .thenReturn(Optional.of(member));

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