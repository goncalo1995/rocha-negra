package com.rochanegra.api.modules.nodes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.domain.NodeLink;
import com.rochanegra.api.modules.nodes.dto.GraphDto;
import com.rochanegra.api.modules.nodes.dto.GraphEdgeDto;
import com.rochanegra.api.modules.nodes.repository.NodeLinkRepository;
import com.rochanegra.api.modules.nodes.repository.NodeRepository;
import com.rochanegra.api.modules.nodes.service.NodeService;
import com.rochanegra.api.modules.nodes.types.NodeLinkType;
import com.rochanegra.api.modules.nodes.types.NodeType;

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
