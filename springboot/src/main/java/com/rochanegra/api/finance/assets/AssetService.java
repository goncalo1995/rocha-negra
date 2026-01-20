package com.rochanegra.api.finance.assets;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.rochanegra.api.core.SanitizationService;
import com.rochanegra.api.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final SanitizationService sanitizationService;

    public void updateBalance(UUID assetId, java.math.BigDecimal amount,
            com.rochanegra.api.finance.types.TransactionType type) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        if (type == com.rochanegra.api.finance.types.TransactionType.income) {
            asset.setCurrentValue(asset.getCurrentValue().add(amount));
        } else if (type == com.rochanegra.api.finance.types.TransactionType.expense) {
            asset.setCurrentValue(asset.getCurrentValue().subtract(amount));
        }
        // Transfer logic can be added here if needed, or treated as expense/income
        // depending on context

        assetRepository.save(asset);
    }

    public void updateAssetDetails(UUID assetId, AssetUpdateDto updateDto) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        asset.setName(updateDto.name());
        asset.setType(updateDto.type());
        asset.setCurrency(updateDto.currency());
        asset.setCurrentValue(updateDto.currentValue());
        asset.setInstitution(updateDto.institution());
        asset.setDescription(updateDto.description());
        // asset.setCustomFields(updateDto.customFields());

        assetRepository.save(asset);
    }

    public AssetDto createAsset(AssetCreateDto createDto, UUID userId) {
        Asset asset = new Asset();
        // Sanitize all string inputs
        asset.setName(sanitizationService.sanitize(createDto.name()));
        asset.setInstitution(sanitizationService.sanitize(createDto.institution()));
        asset.setDescription(sanitizationService.sanitize(createDto.description()));

        // Sanitize the custom fields map
        asset.setCustomFields(sanitizationService.sanitizeMap(createDto.customFields()));

        asset.setType(createDto.type());
        asset.setCurrency(createDto.currency());
        asset.setCurrentValue(createDto.initialValue());
        asset.setUserId(userId);

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
                asset.getCurrentValue(),
                asset.getInstitution(),
                asset.getDescription(),
                asset.getCustomFields(),
                asset.getCreatedAt(),
                asset.getUpdatedAt());
    }
}
