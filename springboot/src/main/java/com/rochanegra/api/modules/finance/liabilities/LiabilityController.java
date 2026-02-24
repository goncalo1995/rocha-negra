package com.rochanegra.api.modules.finance.liabilities;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/liabilities")
@RequiredArgsConstructor
public class LiabilityController {

    private final LiabilityService liabilityService;

    @PostMapping
    public LiabilityDto createLiability(@Valid @RequestBody LiabilityCreateDto createDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return liabilityService.createLiability(createDto, userId);
    }

    @GetMapping
    public List<LiabilityDto> getLiabilities(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return liabilityService.getLiabilities(userId);
    }

    @GetMapping("/{id}")
    public LiabilityDto getLiability(@PathVariable UUID id) {
        return liabilityService.getLiability(id);
    }

    @PatchMapping("/{liabilityId}")
    public ResponseEntity<LiabilityDto> updateLiability(
            @PathVariable UUID liabilityId,
            @RequestBody @Valid LiabilityUpdateDto updateDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        LiabilityDto updatedLiability = liabilityService.updateLiabilityDetails(liabilityId, updateDto, userId);
        return ResponseEntity.ok(updatedLiability);
    }

    @DeleteMapping("/{id}")
    public void deleteLiability(@PathVariable UUID id) {
        liabilityService.deleteLiability(id);
    }
}
