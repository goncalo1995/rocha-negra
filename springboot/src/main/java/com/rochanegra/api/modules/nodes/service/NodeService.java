package com.rochanegra.api.modules.nodes.service;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.common.exception.ForbiddenException;
import com.rochanegra.api.common.exception.ResourceNotFoundException;
import com.rochanegra.api.modules.dashboard.dtos.ProjectsWidgetDto;
import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.domain.NodeLink;
import com.rochanegra.api.modules.nodes.domain.NodeMember;
import com.rochanegra.api.modules.nodes.dto.GraphDto;
import com.rochanegra.api.modules.nodes.dto.GraphEdgeDto;
import com.rochanegra.api.modules.nodes.dto.GraphNodeDto;
import com.rochanegra.api.modules.nodes.dto.MemberAddDto;
import com.rochanegra.api.modules.nodes.dto.NodeCreateDto;
import com.rochanegra.api.modules.nodes.dto.NodeDetailDto;
import com.rochanegra.api.modules.nodes.dto.NodeLinkDto;
import com.rochanegra.api.modules.nodes.dto.NodeMemberDto;
import com.rochanegra.api.modules.nodes.dto.NodeSummaryDto;
import com.rochanegra.api.modules.nodes.dto.NodeTreeDto;
import com.rochanegra.api.modules.nodes.dto.NodeUpdateDto;
import com.rochanegra.api.modules.nodes.repository.NodeLinkRepository;
import com.rochanegra.api.modules.nodes.repository.NodeMemberRepository;
import com.rochanegra.api.modules.nodes.repository.NodeRepository;
import com.rochanegra.api.modules.nodes.types.NodeLinkType;
import com.rochanegra.api.modules.nodes.types.NodeRole;
import com.rochanegra.api.modules.nodes.types.NodeStatus;
import com.rochanegra.api.modules.nodes.types.NodeType;
import com.rochanegra.api.modules.roadmap.domain.ProjectDetails;
import com.rochanegra.api.modules.roadmap.dto.ProjectDetailsDto;
import com.rochanegra.api.modules.roadmap.repository.ProjectDetailsRepository;
import com.rochanegra.api.modules.tasks.dtos.TaskSummaryDto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;
    private final NodeMemberRepository memberRepository;
    private final NodeLinkRepository linkRepository;
    private final ProjectDetailsRepository projectDetailsRepository;
    private final JdbcTemplate jdbcTemplate;

    public ProjectsWidgetDto getNodesWidget(UUID userId) {

        List<Node> active = nodeRepository.findTop3ByUserIdAndStatusOrderByDueDateAsc(
                userId, NodeStatus.ACTIVE);

        return new ProjectsWidgetDto(
                active.size(),
                active.stream()
                        .map(NodeSummaryDto::fromEntity)
                        .toList());
    }

    @Transactional
    public NodeDetailDto createNode(NodeCreateDto createDto, UUID userId) {
        String sql = "SELECT create_node_and_add_owner(?, ?::node_type, ?, ?, ?, ?, ?::node_status)";
        UUID newNodeId = jdbcTemplate.queryForObject(sql, UUID.class, userId, createDto.type().name(),
                createDto.name(),
                createDto.description(), createDto.parentId(), createDto.dueDate(), createDto.status().name());

        Node node = nodeRepository.findById(newNodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found after creation"));

        // Explicitly manage ProjectDetails (No JPA Cascade for safety in V1)
        if (createDto.type() == NodeType.PROJECT) {
            ProjectDetails details = new ProjectDetails(node);
            details.setDesiredOutcome(createDto.desiredOutcome());
            details.setMainRisk(createDto.mainRisk());
            projectDetailsRepository.save(details);
        }

        return toDetailDto(node);
    }

    public List<NodeSummaryDto> getNodesForUser(UUID userId, NodeType type, String query) {
        List<Node> nodes;
        if (query != null && !query.isBlank() && type != null) {
            nodes = nodeRepository.searchNodesByType(userId, type, query);
        } else if (query != null && !query.isBlank()) {
            nodes = nodeRepository.searchNodes(userId, query);
        } else if (type != null) {
            nodes = nodeRepository.findNodesByMemberAndType(userId, type);
        } else {
            nodes = nodeRepository.findNodesByMember(userId);
        }
        return nodes.stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    public NodeDetailDto getNodeById(UUID nodeId, UUID userId) {
        // Your RLS policy already ensures the user is a member, but an extra check in
        // the service is good practice.
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found"));

        return toDetailDto(node);
    }

    public Node validateCanEdit(UUID nodeId, UUID userId) {
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found"));

        NodeMember member = memberRepository.findByNodeIdAndUserId(nodeId, userId)
                .orElseThrow(() -> new ForbiddenException("You do not have access to this node."));

        if (member.getRole() == NodeRole.VIEWER) {
            throw new ForbiddenException("You do not have permission to edit this node.");
        }

        return node;
    }

    public void validateIsProject(Node node) {
        if (node.getType() != NodeType.PROJECT) {
            throw new IllegalArgumentException("This operation is only allowed for PROJECT nodes.");
        }
    }

    @Transactional
    public NodeDetailDto updateNode(UUID nodeId, NodeUpdateDto updateDto, UUID userId) {
        // RLS will ensure user is an owner/editor before this code is even reached.
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found"));

        if (updateDto.name() != null)
            node.setName(updateDto.name());
        if (updateDto.description() != null)
            node.setDescription(updateDto.description());
        if (updateDto.content() != null)
            node.setContent(updateDto.content());
        if (updateDto.url() != null)
            node.setUrl(updateDto.url());
        if (updateDto.storagePath() != null)
            node.setStoragePath(updateDto.storagePath());
        if (updateDto.status() != null)
            node.setStatus(updateDto.status());
        if (updateDto.dueDate() != null)
            node.setDueDate(updateDto.dueDate());

        if (updateDto.parentId() != null) {
            // Validation: Prevent a node from becoming its own parent
            if (updateDto.parentId().equals(nodeId)) {
                throw new IllegalArgumentException("A node cannot be its own parent.");
            }
            // Validation: Prevent cycles (moving into a descendant)
            if (nodeRepository.isDescendant(nodeId, updateDto.parentId())) {
                throw new IllegalArgumentException("Cannot move a node into one of its own descendants.");
            }

            Node parent = nodeRepository.findById(updateDto.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent node not found"));
            node.setParent(parent);
        }

        // Project details update logic
        if (node.getType() == NodeType.PROJECT && node.getProjectDetails() != null) {
            ProjectDetails details = node.getProjectDetails();
            if (updateDto.desiredOutcome() != null) details.setDesiredOutcome(updateDto.desiredOutcome());
            if (updateDto.mainRisk() != null) details.setMainRisk(updateDto.mainRisk());
            if (updateDto.isAiEnabled() != null) details.setIsAiEnabled(updateDto.isAiEnabled());
            projectDetailsRepository.save(details);
        }

        node = nodeRepository.save(node);
        return toDetailDto(node); // Return the full, updated object
    }

    @Transactional
    public NodeMemberDto addMemberToNode(UUID nodeId, MemberAddDto addDto, UUID userId) {
        // RLS ensures only owners can call this.
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found"));

        // Prevent adding a duplicate member
        if (memberRepository.findByNodeIdAndUserId(nodeId, addDto.userId()).isPresent()) {
            throw new IllegalStateException("User is already a member of this node.");
        }

        NodeMember newMember = new NodeMember();
        newMember.setNode(node);
        newMember.setUserId(addDto.userId());
        newMember.setRole(addDto.role());

        NodeMember savedMember = memberRepository.save(newMember);
        return new NodeMemberDto(savedMember.getUserId(), savedMember.getRole().toString());
    }

    @Transactional
    public void removeMemberFromNode(UUID nodeId, UUID memberUserId, UUID currentUserId) {
        // RLS ensures only owners can call this.
        NodeMember member = memberRepository.findByNodeIdAndUserId(nodeId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this node"));

        // Business Rule: Owner cannot remove themselves if they are the last owner.
        if (member.getRole() == NodeRole.OWNER && nodeRepository.countOwners(nodeId) <= 1) {
            throw new IllegalStateException("Cannot remove the last owner of a node.");
        }

        memberRepository.delete(member);
    }

    @Transactional
    public void deleteNode(UUID nodeId, UUID userId) {
        // RLS ensures only owners can delete.
        // We might want to check roles here explicitly for clarity, but database rules
        // should handle it.
        // For safety, let's verify existence.
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found"));

        // Application-level check provides a better error message.
        NodeMember member = memberRepository.findByNodeIdAndUserId(nodeId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this node."));

        if (member.getRole() != NodeRole.OWNER) {
            throw new ForbiddenException("Only owners can delete a node.");
        }

        linkRepository.deleteBySourceNodeIdOrTargetNodeId(nodeId, nodeId);
        nodeRepository.delete(node);
    }

    @Transactional
    public NodeLinkDto addLink(UUID sourceNodeId, UUID targetNodeId, NodeLinkType type, UUID userId) {
        // Business rule: A node cannot link to itself.
        if (sourceNodeId.equals(targetNodeId)) {
            throw new IllegalArgumentException("A node cannot be linked to itself.");
        }

        // RLS will ensure user has at least read access to both nodes
        Node sourceNode = nodeRepository.findById(sourceNodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Source node not found"));
        Node targetNode = nodeRepository.findById(targetNodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Target node not found"));

        // Check for existing link
        Optional<NodeLink> existingLink = linkRepository.findBySourceNodeIdAndTargetNodeIdAndType(
                sourceNodeId, targetNodeId, type);
        if (existingLink.isPresent()) {
            // Link already exists, maybe just return 200 OK or throw an exception.
            // For idempotency, we can just do nothing.
            return toLinkDto(existingLink.get());
        }

        NodeLink newLink = new NodeLink();
        newLink.setSourceNode(sourceNode);
        newLink.setTargetNode(targetNode);
        newLink.setType(type);
        newLink.setCreatedBy(userId);

        linkRepository.save(newLink);
        return toLinkDto(newLink);
    }

    @Transactional
    public void removeLink(UUID sourceNodeId, UUID targetNodeId, UUID userId) {
        // RLS ensures user has permission to modify the source node.
        NodeLink link = linkRepository.findBySourceNodeIdAndTargetNodeId(sourceNodeId, targetNodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Link between nodes not found"));

        // Optional: Add role check here later if needed

        linkRepository.delete(link);
    }

    // Graph
    public GraphDto getGraph(UUID rootNodeId, UUID userId) {

        Node root = nodeRepository.findById(rootNodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found"));

        List<NodeLink> links = linkRepository
                .findBySourceNodeIdOrTargetNodeId(rootNodeId, rootNodeId);

        Set<Node> nodes = new HashSet<>();
        nodes.add(root);

        List<GraphEdgeDto> edges = new ArrayList<>();

        for (NodeLink link : links) {
            Node source = link.getSourceNode();
            Node target = link.getTargetNode();

            nodes.add(source);
            nodes.add(target);

            edges.add(new GraphEdgeDto(
                    source.getId(),
                    target.getId(),
                    link.getType()));
        }

        List<GraphNodeDto> nodeDtos = nodes.stream()
                .map(n -> new GraphNodeDto(
                        n.getId(),
                        n.getName(),
                        n.getType()))
                .toList();

        return new GraphDto(nodeDtos, edges);
    }

    // --- Tree & Move Logic ---

    public List<NodeTreeDto> getNodesTree(UUID userId) {
        // Fetch all non-archived nodes for the creator to build tree in memory
        // We exclude ARCHIVED nodes from the sidebar tree usually.
        List<Node> allNodes = nodeRepository.findAllByUserIdAndStatusNot(userId, NodeStatus.ARCHIVED);

        // Group by parentId
        // We want to return a list of "Root" nodes (where parent is null or parent is
        // not in the set)
        // But for PARA, we might want to group by Type explicitly if they are roots.

        // 1. Map all nodes by ID for easy access
        // 2. Build children lists
        // 3. Identification of Roots

        // Let's do a simple build.
        // We will organize roots by PARA types specifically for the sidebar structure?
        // Or just return the raw tree and let frontend organize?
        // The user asked for Projects, Areas, Resources.
        // Let's return a list where top-level items are the ones with parentId = null.

        // Actually, to make it easier for the recursion, we convert to DTOs first and
        // link them.

        return buildTree(allNodes);
    }

    private List<NodeTreeDto> buildTree(List<Node> nodes) {
        // This can be optimized, but for N < 1000 this is fine.

        // Map id -> NodeTreeDto (mutable children list initially)
        // We need a helper class or just use the record strings.
        // Records are immutable, so we can't easily add children after creation.
        // Let's use a helper map of Id -> List<ChildNode>.

        var childrenMap = nodes.stream()
                .filter(n -> n.getParent() != null)
                .collect(Collectors.groupingBy(n -> n.getParent().getId()));

        // Helper to recursively build
        return nodes.stream()
                .filter(n -> n.getParent() == null) // Roots
                .map(root -> buildDtoRecursive(root, childrenMap))
                .collect(Collectors.toList());
    }

    private NodeTreeDto buildDtoRecursive(Node node, java.util.Map<UUID, List<Node>> childrenMap) {
        List<Node> childrenEntities = childrenMap.getOrDefault(node.getId(), List.of());

        // Sort children by Name or other criteria?
        // Sort projects/areas by name?
        // childrenEntities.sort(Comparator.comparing(Node::getName));

        List<NodeTreeDto> childrenDtos = childrenEntities.stream()
                .map(child -> buildDtoRecursive(child, childrenMap))
                .collect(Collectors.toList());

        return new NodeTreeDto(
                node.getId(),
                node.getName(),
                node.getType(),
                childrenDtos,
                childrenDtos.size() // Or task count? For now expanding children count.
        );
    }

    // --- Mapper Methods ---

    private NodeLinkDto toLinkDto(NodeLink link) {
        return new NodeLinkDto(
                link.getTargetNode().getId(),
                link.getTargetNode().getName(),
                link.getTargetNode().getType(),
                link.getType(),
                link.getCreatedBy(),
                link.getCreatedAt());
    }

    private NodeSummaryDto toSummaryDto(Node node) {
        return new NodeSummaryDto(
                node.getId(),
                node.getName(),
                node.getStatus(),
                node.getType(),
                node.getDueDate(),
                node.getCreatedAt(),
                node.getUpdatedAt(),
                node.getMembers().size(),
                node.getTasks().size());
    }

    private NodeDetailDto toDetailDto(Node node) {
        List<NodeMemberDto> members = node.getMembers().stream()
                .map(m -> new NodeMemberDto(m.getUserId(), m.getRole().toString()))
                .collect(Collectors.toList());

        // Filter the stream to only include tasks where the parent is null.
        List<TaskSummaryDto> tasks = node.getTasks().stream()
                .filter(t -> t.getParent() == null)
                .map(t -> new TaskSummaryDto(t.getId(), t.getTitle(), t.getStatus().toString(), t.getPriority(),
                        t.getDueDate()))
                .collect(Collectors.toList());

        List<NodeSummaryDto> children = node.getChildren().stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());

        List<NodeLinkDto> references = node.getLinksTo().stream()
                .map(link -> new NodeLinkDto(
                        link.getTargetNode().getId(),
                        link.getTargetNode().getName(),
                        link.getTargetNode().getType(),
                        link.getType(),
                        link.getCreatedBy(),
                        link.getCreatedAt()))
                .collect(Collectors.toList());

        List<NodeLinkDto> referencedBy = node.getLinkedFrom().stream()
                .map(link -> new NodeLinkDto(
                        link.getSourceNode().getId(),
                        link.getSourceNode().getName(),
                        link.getSourceNode().getType(),
                        link.getType(),
                        link.getCreatedBy(),
                        link.getCreatedAt()))
                .collect(Collectors.toList());

        List<NodeSummaryDto> ancestors = nodeRepository.findAncestors(node.getId()).stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());

        ProjectDetailsDto projectDetails = null;
        if (node.getProjectDetails() != null) {
            projectDetails = new ProjectDetailsDto(
                    node.getProjectDetails().getNodeId(),
                    node.getProjectDetails().getDesiredOutcome(),
                    node.getProjectDetails().getMainRisk(),
                    node.getProjectDetails().getProgress(),
                    node.getProjectDetails().getIsAiEnabled());
        }

        return new NodeDetailDto(
                node.getId(),
                node.getParent() != null ? node.getParent().getId() : null,
                node.getType(),
                node.getName(),
                node.getDescription(),
                node.getStatus(),
                node.getIcon(),
                node.getContent(),
                node.getUrl(),
                node.getStoragePath(),
                node.getStartDate(),
                node.getDueDate(),
                node.getCompletedAt(),
                node.getCustomFields(),
                node.getCreatedAt(),
                node.getUpdatedAt(),
                members,
                tasks,
                children,
                referencedBy,
                references,
                ancestors,
                projectDetails);
    }
}