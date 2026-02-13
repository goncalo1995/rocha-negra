package com.rochanegra.api.nodes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.nodes.dto.NodeLinkDto;
import com.rochanegra.api.nodes.types.NodeType;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// This tells JUnit 5 to enable Mockito's annotation support
@ExtendWith(MockitoExtension.class)
class NodeLinkServiceTest {

    // --- MOCKS ---
    // These are the fake dependencies that NodeService needs.
    @Mock
    private NodeRepository nodeRepository;
    @Mock
    private NodeLinkRepository linkRepository;
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

    @BeforeEach
    void setUp() {
        // Set up common variables before each test
        mockUserId = UUID.randomUUID();
    }

    // addLink_Success: Test that a link is successfully created when valid source
    // and target IDs are provided.
    @Test
    void addLink_Success_CreatesLinkAndReturnsDto() {
        // Arrange
        UUID sourceId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        String label = "related to";

        Node sourceNode = new Node();
        sourceNode.setId(sourceId);
        sourceNode.setName("Source");
        sourceNode.setType(NodeType.PROJECT);

        Node targetNode = new Node();
        targetNode.setId(targetId);
        targetNode.setName("Target");
        targetNode.setType(NodeType.AREA);

        NodeLink createdLink = new NodeLink();
        createdLink.setId(UUID.randomUUID());
        createdLink.setSourceNode(sourceNode);
        createdLink.setTargetNode(targetNode);
        createdLink.setLabel(label);

        when(nodeRepository.findById(sourceId)).thenReturn(Optional.of(sourceNode));
        when(nodeRepository.findById(targetId)).thenReturn(Optional.of(targetNode));
        when(linkRepository.save(any(NodeLink.class))).thenReturn(createdLink);

        // Act
        nodeService.addLink(sourceId, targetId, label, mockUserId);

        // Assert
        verify(linkRepository, times(1)).save(any(NodeLink.class));
    }

    // addLink_SourceNodeNotFound_ThrowsException: Verify a
    // ResourceNotFoundException is thrown if the source node doesn't exist.
    @Test
    void addLink_SourceNodeNotFound_ThrowsException() {
        // Arrange
        UUID sourceId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();

        // Mock that the source node is not found
        when(nodeRepository.findById(sourceId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            nodeService.addLink(sourceId, targetId, "related to", mockUserId);
        });

        // Verify the repository was not called to save (it should fail before that)
        verify(linkRepository, never()).save(any(NodeLink.class));
    }

    // addLink_TargetNodeNotFound_ThrowsException: Verify a
    // ResourceNotFoundException is thrown if the target node doesn't exist.
    @Test
    void addLink_TargetNodeNotFound_ThrowsException() {
        // Arrange
        UUID sourceId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();

        // Mock that the target node is not found
        when(nodeRepository.findById(sourceId)).thenReturn(Optional.of(new Node()));
        when(nodeRepository.findById(targetId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            nodeService.addLink(sourceId, targetId, "related to", mockUserId);
        });

        // Verify the repository was not called to save
        verify(linkRepository, never()).save(any(NodeLink.class));
    }

    // addLink_LinkToSelf_ThrowsException: Verify an IllegalArgumentException is
    // thrown when source and target IDs are the same.
    @Test
    void addLink_LinkToSelf_ThrowsException() {
        // Arrange
        UUID nodeId = UUID.randomUUID();
        String label = "self-reference";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            nodeService.addLink(nodeId, nodeId, label, mockUserId);
        });

        // Verify no repository methods were called
        verify(nodeRepository, never()).findById(any(UUID.class));
        verify(linkRepository, never()).save(any(NodeLink.class));
    }

    // addLink_AlreadyExists_DoesNothing: Test that calling addLink twice with the
    // same IDs doesn't cause an error (idempotency).
    @Test
    void addLink_AlreadyExists_DoesNothing() {
        // Arrange
        UUID sourceId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        String label = "related to";

        Node sourceNode = new Node();
        sourceNode.setId(sourceId);

        Node targetNode = new Node();
        targetNode.setId(targetId);
        targetNode.setName("Target");
        targetNode.setType(NodeType.AREA);

        NodeLink existingLink = new NodeLink();
        existingLink.setSourceNode(sourceNode);
        existingLink.setTargetNode(targetNode);
        existingLink.setLabel(label);

        when(nodeRepository.findById(sourceId)).thenReturn(Optional.of(sourceNode));
        when(nodeRepository.findById(targetId)).thenReturn(Optional.of(targetNode));

        when(linkRepository.findBySourceNodeIdAndTargetNodeId(sourceId, targetId))
                .thenReturn(Optional.of(existingLink));

        // Act
        NodeLinkDto result = nodeService.addLink(sourceId, targetId, label, mockUserId);

        // Assert
        assertNotNull(result);
        assertEquals(targetId, result.targetNodeId());
        assertEquals("Target", result.targetNodeName());
        assertEquals(NodeType.AREA, result.targetNodeType());
        assertEquals(label, result.label());

        verify(linkRepository, times(1))
                .findBySourceNodeIdAndTargetNodeId(sourceId, targetId);

        verify(linkRepository, never()).save(any(NodeLink.class));
    }

    // removeLink_Success: Test that a link is successfully deleted.
    @Test
    void removeLink_Success_DeletesLink() {
        // Arrange
        UUID sourceId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();

        NodeLink link = new NodeLink();
        link.setId(UUID.randomUUID());

        when(linkRepository.findBySourceNodeIdAndTargetNodeId(sourceId, targetId))
                .thenReturn(Optional.of(link));

        // Act
        nodeService.removeLink(sourceId, targetId, mockUserId);

        // Assert
        verify(linkRepository, times(1)).delete(link);
    }

    // removeLink_NotFound_ThrowsException: Verify a ResourceNotFoundException is
    // thrown if the link to be removed doesn't exist.
    @Test
    void removeLink_NotFound_ThrowsException() {
        // Arrange
        UUID sourceId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();

        when(linkRepository.findBySourceNodeIdAndTargetNodeId(sourceId, targetId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            nodeService.removeLink(sourceId, targetId, mockUserId);
        });

        verify(linkRepository, never()).delete(any(NodeLink.class));
    }
}