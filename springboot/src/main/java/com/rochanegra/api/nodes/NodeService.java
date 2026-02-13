package com.rochanegra.api.nodes;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.dashboard.dtos.NodesWidgetDto;
import com.rochanegra.api.exception.ForbiddenException;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.nodes.dto.GraphDto;
import com.rochanegra.api.nodes.dto.GraphEdgeDto;
import com.rochanegra.api.nodes.dto.GraphNodeDto;
import com.rochanegra.api.nodes.dto.MemberAddDto;
import com.rochanegra.api.nodes.dto.NodeCreateDto;
import com.rochanegra.api.nodes.dto.NodeDetailDto;
import com.rochanegra.api.nodes.dto.NodeLinkDto;
import com.rochanegra.api.nodes.dto.NodeMemberDto;
import com.rochanegra.api.nodes.dto.NodeSummaryDto;
import com.rochanegra.api.nodes.dto.NodeUpdateDto;
import com.rochanegra.api.nodes.types.NodeLinkType;
import com.rochanegra.api.nodes.types.NodeRole;
import com.rochanegra.api.nodes.types.NodeStatus;
import com.rochanegra.api.nodes.types.NodeType;
import com.rochanegra.api.tasks.dtos.TaskSummaryDto;

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
    private final JdbcTemplate jdbcTemplate;

    public NodesWidgetDto getNodesWidget(UUID userId) {

        List<Node> active = nodeRepository.findTop3ByUserIdAndStatusOrderByDueDateAsc(
                userId, NodeStatus.ACTIVE);

        return new NodesWidgetDto(
                active.size(),
                active.stream()
                        .map(NodeSummaryDto::fromEntity)
                        .toList());
    }

    @Transactional
    public NodeDetailDto createNode(NodeCreateDto createDto, UUID userId) {
        String sql = "SELECT create_node_and_add_owner(?, ?::node_type, ?, ?)";
        UUID newNodeId = jdbcTemplate.queryForObject(sql, UUID.class, userId, createDto.type().name(), createDto.name(),
                createDto.description());

        return getNodeById(newNodeId, userId);
    }

    public List<NodeSummaryDto> getNodesForUser(UUID userId, NodeType type) {
        List<Node> nodes;
        if (type != null) {
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
            Node parent = nodeRepository.findById(updateDto.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent node not found"));
            node.setParent(parent);
        }

        Node savedNode = nodeRepository.save(node);
        return toDetailDto(savedNode); // Return the full, updated object
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
                .map(t -> new TaskSummaryDto(t.getId(), t.getTitle(), t.getStatus().toString(), t.getDueDate()))
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
                references);
    }
}