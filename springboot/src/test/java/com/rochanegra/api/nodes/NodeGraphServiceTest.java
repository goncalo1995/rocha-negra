package com.rochanegra.api.nodes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.rochanegra.api.nodes.dto.GraphDto;
import com.rochanegra.api.nodes.dto.GraphEdgeDto;
import com.rochanegra.api.nodes.types.NodeLinkType;
import com.rochanegra.api.nodes.types.NodeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NodeGraphServiceTest {

    @Mock
    private NodeRepository nodeRepository;

    @Mock
    private NodeLinkRepository linkRepository;

    @InjectMocks
    private NodeService nodeService;

    private UUID mockUserId;

    @BeforeEach
    void setUp() {
        // Set up common variables before each test
        mockUserId = UUID.randomUUID();
    }

    @Test
    void getGraph_ShouldReturnNodesAndEdges() {

        UUID rootId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        Node root = new Node();
        root.setId(rootId);
        root.setName("Root");
        root.setType(NodeType.PROJECT);

        Node other = new Node();
        other.setId(otherId);
        other.setName("Resource A");
        other.setType(NodeType.RESOURCE);

        NodeLink link = new NodeLink();
        link.setSourceNode(root);
        link.setTargetNode(other);
        link.setType(NodeLinkType.DEPENDS_ON);

        when(nodeRepository.findById(rootId))
                .thenReturn(Optional.of(root));

        when(linkRepository.findBySourceNodeIdOrTargetNodeId(rootId, rootId))
                .thenReturn(List.of(link));

        GraphDto result = nodeService.getGraph(rootId, mockUserId);

        assertEquals(2, result.nodes().size());
        assertEquals(1, result.edges().size());

        GraphEdgeDto edge = result.edges().get(0);
        assertEquals(rootId, edge.sourceId());
        assertEquals(otherId, edge.targetId());
        assertEquals(NodeLinkType.DEPENDS_ON, edge.type());
    }
}
