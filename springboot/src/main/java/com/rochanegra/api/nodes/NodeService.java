package com.rochanegra.api.nodes;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.nodes.dto.MemberAddDto;
import com.rochanegra.api.nodes.dto.NodeCreateDto;
import com.rochanegra.api.nodes.dto.NodeDetailDto;
import com.rochanegra.api.nodes.dto.NodeMemberDto;
import com.rochanegra.api.nodes.dto.NodeSummaryDto;
import com.rochanegra.api.nodes.dto.NodeUpdateDto;
import com.rochanegra.api.nodes.dto.TaskSummaryDto;
import com.rochanegra.api.nodes.types.NodeRole;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;
    private final NodeMemberRepository memberRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public NodeDetailDto createNode(NodeCreateDto createDto, UUID userId) {
        String sql = "SELECT create_node_and_add_owner(?, ?::node_type, ?, ?)";
        UUID newNodeId = jdbcTemplate.queryForObject(sql, UUID.class, userId, createDto.type().name(), createDto.name(),
                createDto.description());

        return getNodeById(newNodeId, userId);
    }

    public List<NodeSummaryDto> getNodesForUser(UUID userId) {
        List<Node> nodes = nodeRepository.findNodesByMember(userId);
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

        nodeRepository.delete(node);
    }

    // --- Mapper Methods ---

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
                children);
    }
}