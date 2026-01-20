package com.rochanegra.api.finance.assets;

import lombok.RequiredArgsConstructor;
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

    // @PatchMapping("/{id}")
    // public AssetDto updateAsset(@PathVariable UUID id, @Valid @RequestBody
    // AssetCreateDto updateDto) {
    // return assetService.updateAsset(id, updateDto);
    // }

    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
    }
}
