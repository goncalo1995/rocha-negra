package com.rochanegra.api.finance.assets;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public AssetDto createAsset(@Valid @RequestBody AssetCreateDto createDto, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return assetService.createAsset(createDto, userId);
    }

    @GetMapping
    public List<AssetDto> getAssets(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return assetService.getAssets(userId);
    }

    @GetMapping("/{id}")
    public AssetDto getAsset(@PathVariable UUID id) {
        return assetService.getAsset(id);
    }

    @PatchMapping("/{assetId}")
    public ResponseEntity<AssetDto> updateAsset(
            @PathVariable UUID assetId,
            @RequestBody @Valid AssetUpdateDto updateDto, // Use the new, safe DTO
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        assetService.updateAssetDetails(assetId, updateDto, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        assetService.deleteAsset(id, userId);
    }
}
