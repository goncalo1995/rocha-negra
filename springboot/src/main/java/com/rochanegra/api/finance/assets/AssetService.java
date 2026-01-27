package com.rochanegra.api.finance.assets;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.rochanegra.api.core.SanitizationService;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.types.AssetType;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final SanitizationService sanitizationService;

    @Transactional
    public void updateAssetDetails(UUID assetId, AssetUpdateDto updateDto, UUID userId) {
        Asset asset = assetRepository.findById(assetId)
                .filter(a -> a.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found or access denied"));

        // Sanitize and update only the safe fields
        if (updateDto.name() != null) {
            asset.setName(sanitizationService.sanitize(updateDto.name()));
        }
        if (updateDto.institution() != null) {
            asset.setInstitution(sanitizationService.sanitize(updateDto.institution()));
        }
        if (updateDto.description() != null) {
            asset.setDescription(sanitizationService.sanitize(updateDto.description()));
        }
        if (updateDto.customFields() != null) {
            asset.setCustomFields(sanitizationService.sanitizeMap(updateDto.customFields()));
        }

        assetRepository.save(asset);
    }

    public AssetDto createAsset(AssetCreateDto createDto, UUID userId) {
        Asset asset = new Asset();
        asset.setUserId(userId);
        // Sanitize all string inputs
        asset.setName(sanitizationService.sanitize(createDto.name()));
        asset.setInstitution(sanitizationService.sanitize(createDto.institution()));
        asset.setDescription(sanitizationService.sanitize(createDto.description()));
        asset.setCustomFields(sanitizationService.sanitizeMap(createDto.customFields()));
        asset.setType(createDto.type());
        asset.setCurrency(createDto.currency());

        // Default the value to zero if the user provides null or doesn't send the
        // field.
        BigDecimal value = createDto.initialValue() != null ? createDto.initialValue() : BigDecimal.ZERO;

        List<AssetType> balanceBasedTypes = List.of(AssetType.bank_account, AssetType.cash, AssetType.credit_card);

        if (balanceBasedTypes.contains(createDto.type())) {
            // It's a cash-like asset, so we set its balance.
            asset.setBalance(value);
            asset.setQuantity(null); // Ensure the other field is null
        } else {
            // It's a unit-based asset (vehicle, property, stock, crypto). We set its
            // quantity.
            asset.setQuantity(value);
            asset.setBalance(null); // Ensure the other field is null
        }

        Asset savedAsset = assetRepository.save(asset);
        return toDto(savedAsset);
    }

    public List<AssetDto> getAssets(UUID userId) {
        return assetRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AssetDto getAsset(UUID assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        return toDto(asset);
    }

    public void deleteAsset(UUID assetId) {
        assetRepository.deleteById(assetId);
    }

    private AssetDto toDto(Asset asset) {
        return new AssetDto(
                asset.getId(),
                asset.getName(),
                asset.getType(),
                asset.getQuantity(),
                asset.getBalance(),
                asset.getCurrency(),
                asset.getInstitution(),
                asset.getDescription(),
                asset.getCustomFields(),
                asset.getCreatedAt(),
                asset.getUpdatedAt());
    }
}
