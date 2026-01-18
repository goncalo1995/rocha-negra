package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    public void updateBalance(UUID assetId, java.math.BigDecimal amount,
            com.rochanegra.api.finance.types.TransactionType type) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found")); // todo: custom exception

        if (type == com.rochanegra.api.finance.types.TransactionType.income) {
            asset.setCurrentValue(asset.getCurrentValue().add(amount));
        } else if (type == com.rochanegra.api.finance.types.TransactionType.expense) {
            asset.setCurrentValue(asset.getCurrentValue().subtract(amount));
        }
        // Transfer logic can be added here if needed, or treated as expense/income
        // depending on context

        assetRepository.save(asset);
    }

    public AssetDto createAsset(AssetCreateDto createDto, UUID userId) {
        Asset asset = new Asset();
        asset.setName(createDto.name());
        asset.setType(createDto.type());
        asset.setCurrentValue(createDto.currentValue());
        asset.setInstitution(createDto.institution());
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
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        return toDto(asset);
    }

    public AssetDto updateAsset(UUID assetId, AssetCreateDto updateDto) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        if (updateDto.name() != null)
            asset.setName(updateDto.name());
        if (updateDto.type() != null)
            asset.setType(updateDto.type());
        if (updateDto.currentValue() != null)
            asset.setCurrentValue(updateDto.currentValue());
        if (updateDto.institution() != null)
            asset.setInstitution(updateDto.institution());

        Asset savedAsset = assetRepository.save(asset);
        return toDto(savedAsset);
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
                asset.getInstitution());
    }
}
