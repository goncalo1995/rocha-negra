package com.rochanegra.api.modules.nodes.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.rochanegra.api.modules.blueprint.service.BlueprintService;
import com.rochanegra.api.modules.nodes.dto.*;
import com.rochanegra.api.modules.nodes.service.NodeService;
import com.rochanegra.api.modules.nodes.types.NodeType;
import com.rochanegra.api.modules.tasks.TaskService;
import com.rochanegra.api.modules.tasks.dtos.TaskCreateDto;
import com.rochanegra.api.modules.tasks.dtos.TaskDto;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<NodeDetailDto> createNode(@RequestBody @Valid NodeCreateDto createDto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        NodeDetailDto newNode = nodeService.createNode(createDto, userId);
        return new ResponseEntity<>(newNode, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<NodeSummaryDto>> getMyNodes(@RequestParam(required = false) NodeType type,
            @RequestParam(required = false) String query,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(nodeService.getNodesForUser(userId, type, query));
    }

    @GetMapping("/tree")
    public ResponseEntity<List<NodeTreeDto>> getNodesTree(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(nodeService.getNodesTree(userId));
    }

    @GetMapping("/{nodeId}")
    public ResponseEntity<NodeDetailDto> getNodeById(@PathVariable UUID nodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(nodeService.getNodeById(nodeId, userId));
    }

    @PatchMapping("/{nodeId}")
    public ResponseEntity<NodeDetailDto> updateNode(@PathVariable UUID nodeId,
            @RequestBody @Valid NodeUpdateDto updateDto, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(nodeService.updateNode(nodeId, updateDto, userId));
    }

    @DeleteMapping("/{nodeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNode(@PathVariable UUID nodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        nodeService.deleteNode(nodeId, userId);
    }

    // --- Member Endpoints ---
    @PostMapping("/{nodeId}/members")
    public ResponseEntity<NodeMemberDto> addMember(@PathVariable UUID nodeId,
            @RequestBody @Valid MemberAddDto addDto, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return new ResponseEntity<>(nodeService.addMemberToNode(nodeId, addDto, userId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{nodeId}/members/{memberUserId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable UUID nodeId, @PathVariable UUID memberUserId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        nodeService.removeMemberFromNode(nodeId, memberUserId, userId);
    }

    // --- Task Endpoints ---
    @GetMapping("/{nodeId}/tasks")
    public ResponseEntity<List<TaskDto>> getTasksForNode(@PathVariable UUID nodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(taskService.getTasksForNode(nodeId, userId));
    }

    @PostMapping("/{nodeId}/tasks")
    public ResponseEntity<TaskDto> createTaskInNode(@PathVariable UUID nodeId,
            @RequestBody @Valid TaskCreateDto createDto, Authentication auth) {
        // Ensure the DTO's nodeId matches the path for consistency
        if (!nodeId.equals(createDto.nodeId())) {
            throw new IllegalArgumentException("Node ID in path does not match body.");
        }
        UUID userId = UUID.fromString(auth.getName());
        return new ResponseEntity<>(taskService.createTask(createDto, userId), HttpStatus.CREATED);
    }

    // --- Link Endpoints ---
    @PostMapping("/{sourceNodeId}/links")
    public ResponseEntity<Void> addLink(@PathVariable UUID sourceNodeId, @RequestBody @Valid NodeLinkCreateDto linkDto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        nodeService.addLink(sourceNodeId, linkDto.targetNodeId(), linkDto.type(), userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{sourceNodeId}/links/{targetNodeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeLink(@PathVariable UUID sourceNodeId, @PathVariable UUID targetNodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        nodeService.removeLink(sourceNodeId, targetNodeId, userId);
    }

    @GetMapping("/{nodeId}/graph")
    public ResponseEntity<GraphDto> getGraph(@PathVariable UUID nodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(nodeService.getGraph(nodeId, userId));
    }

    // --- Share Endpoints ---
    @PostMapping("/{nodeId}/share")
    public ResponseEntity<NodeShareDto> enableShare(@PathVariable UUID nodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(nodeService.enableShare(nodeId, userId));
    }

    @PostMapping("/{nodeId}/share/disable")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disableShare(@PathVariable UUID nodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        nodeService.disableShare(nodeId, userId);
    }

    @PostMapping("/{nodeId}/share/regenerate")
    public ResponseEntity<NodeShareDto> regenerateShareToken(@PathVariable UUID nodeId, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(nodeService.regenerateShareToken(nodeId, userId));
    }

    @GetMapping("/{nodeId}/share/stats")
    public ResponseEntity<NodeShareStatsDto> getShareStats(@PathVariable UUID nodeId) {
        return ResponseEntity.ok(nodeService.getShareStats(nodeId));
    }

    // Public endpoint - no auth required
    @GetMapping("/share/{token}")
    public ResponseEntity<PublicNodeDto> getPublicNodeByToken(@PathVariable UUID token,
            jakarta.servlet.http.HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        String userAgent = request.getHeader("User-Agent");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        return ResponseEntity.ok(nodeService.getPublicNodeByToken(token, ipAddress, userAgent));
    }
}