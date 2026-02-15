package com.rochanegra.api.links;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/relations")
@RequiredArgsConstructor
public class LinkController {

    private final LinkService linkService;

    @PostMapping
    public ResponseEntity<LinkDto> createLink(
            @RequestBody @Valid LinkCreateDto createDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        LinkDto newLink = linkService.createLink(createDto, userId);
        return new ResponseEntity<>(newLink, HttpStatus.CREATED);
    }

    // This is a powerful endpoint for the frontend.
    // e.g., GET /api/v1/links?targetId=...&targetType=project
    // to get all transactions, tasks, etc., linked to a project.
    @GetMapping
    public ResponseEntity<List<LinkDto>> getLinksByTarget(
            @RequestParam UUID targetId,
            @RequestParam String targetType,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<LinkDto> links = linkService.getLinksForTarget(targetId, targetType, userId);
        return ResponseEntity.ok(links);
    }

    @GetMapping("/source/{sourceId}")
    public ResponseEntity<List<LinkDto>> getLinksBySource(
            @PathVariable UUID sourceId,
            @RequestParam(required = false) String sourceType,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<LinkDto> links = linkService.getLinksForSource(sourceId, sourceType, userId);
        return ResponseEntity.ok(links);
    }

    @DeleteMapping("/{linkId}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable UUID linkId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        linkService.deleteLink(linkId, userId);
        return ResponseEntity.noContent().build();
    }
}