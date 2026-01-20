package com.rochanegra.api.finance.liabilities;

import lombok.RequiredArgsConstructor;
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

    @PatchMapping("/{id}")
    public LiabilityDto updateLiability(@PathVariable UUID id, @Valid @RequestBody LiabilityCreateDto updateDto) {
        return liabilityService.updateLiability(id, updateDto);
    }

    @DeleteMapping("/{id}")
    public void deleteLiability(@PathVariable UUID id) {
        liabilityService.deleteLiability(id);
    }
}
