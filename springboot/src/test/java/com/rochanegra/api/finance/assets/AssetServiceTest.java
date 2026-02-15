package com.rochanegra.api.finance.assets;

import com.rochanegra.api.core.SanitizationService;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.types.AssetType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private SanitizationService sanitizationService;

    @InjectMocks
    private AssetService assetService;

    private UUID userId;
    private UUID assetId;
    private Asset asset;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        assetId = UUID.randomUUID();
        asset = new Asset();
        asset.setId(assetId);
        asset.setUserId(userId);
        asset.setName("Bank Account");
        asset.setType(AssetType.bank_account);

        lenient().when(sanitizationService.sanitize(anyString())).thenAnswer(i -> i.getArgument(0));
        lenient().when(sanitizationService.sanitizeMap(any())).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void createAsset_bankAccount_shouldSetBalance() {
        AssetCreateDto createDto = new AssetCreateDto("Test", AssetType.bank_account, "EUR", BigDecimal.valueOf(100),
                null, null, "Bank", "Desc", null);

        when(assetRepository.save(any(Asset.class))).thenAnswer(i -> {
            Asset a = i.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        AssetDto result = assetService.createAsset(createDto, userId);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(100), result.balance());
        assertNull(result.quantity());
        verify(assetRepository).save(any(Asset.class));
    }

    @Test
    void createAsset_stock_shouldSetQuantity() {
        AssetCreateDto createDto = new AssetCreateDto("Stock", AssetType.stock, "USD", BigDecimal.valueOf(10), null,
                null, null, null, null);

        when(assetRepository.save(any(Asset.class))).thenAnswer(i -> {
            Asset a = i.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        AssetDto result = assetService.createAsset(createDto, userId);

        assertEquals(BigDecimal.valueOf(10), result.quantity());
        assertNull(result.balance());
    }

    @Test
    void updateAssetDetails_found_shouldSanitizeAndSave() {
        AssetUpdateDto updateDto = new AssetUpdateDto("New Name", "New Bank", "New Desc", null, null, null);
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));

        assetService.updateAssetDetails(assetId, updateDto, userId);

        assertEquals("New Name", asset.getName());
        verify(sanitizationService, atLeastOnce()).sanitize("New Name");
        verify(assetRepository).save(asset);
    }

    @Test
    void updateAssetDetails_wrongUser_shouldThrowResourceNotFoundException() {
        AssetUpdateDto updateDto = new AssetUpdateDto("New Name", null, null, null, null, null);
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));

        assertThrows(ResourceNotFoundException.class,
                () -> assetService.updateAssetDetails(assetId, updateDto, UUID.randomUUID()));
    }
}
