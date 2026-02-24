package com.rochanegra.api.modules.finance.liabilities;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.rochanegra.api.common.exception.ResourceNotFoundException;
import com.rochanegra.api.common.utils.SanitizationService;

@Service
@RequiredArgsConstructor
public class LiabilityService {

    private final LiabilityRepository liabilityRepository;
    private final SanitizationService sanitizationService;

    // Same as the AssetService, this method modifies a balance without a
    // corresponding transaction and must be removed.
    // Payments to a liability are financial transactions and must be created via
    // the TransactionService.
    // public void updateBalance(UUID liabilityId, java.math.BigDecimal amount,
    // com.rochanegra.api.finance.types.TransactionType type) {
    // Liability liability = liabilityRepository.findById(liabilityId)
    // .orElseThrow(() -> new ResourceNotFoundException("Liability not found"));

    // if (type == com.rochanegra.api.finance.types.TransactionType.income) {
    // liability.setCurrentBalance(liability.getCurrentBalance().add(amount));
    // } else if (type == com.rochanegra.api.finance.types.TransactionType.expense)
    // {
    // liability.setCurrentBalance(liability.getCurrentBalance().subtract(amount));
    // }

    // liabilityRepository.save(liability);
    // }

    public LiabilityDto createLiability(LiabilityCreateDto createDto, UUID userId) {
        Liability liability = new Liability();
        liability.setName(createDto.name());
        liability.setType(createDto.type());
        liability.setCurrency(createDto.currency());
        liability.setInitialAmount(createDto.initialAmount());
        liability.setCurrentBalance(createDto.currentBalance());
        liability.setInterestRate(createDto.interestRate());
        liability.setDescription(createDto.description());
        liability.setCustomFields(createDto.customFields());
        liability.setUserId(userId);

        Liability savedLiability = liabilityRepository.save(liability);
        return toDto(savedLiability);
    }

    public List<LiabilityDto> getLiabilities(UUID userId) {
        return liabilityRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public LiabilityDto getLiability(UUID liabilityId) {
        Liability liability = liabilityRepository.findById(liabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Liability not found"));
        return toDto(liability);
    }

    @Transactional
    public LiabilityDto updateLiabilityDetails(UUID liabilityId, LiabilityUpdateDto updateDto, UUID userId) {
        // Fetch the liability and verify ownership
        Liability liability = liabilityRepository.findById(liabilityId)
                .filter(l -> l.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Liability not found or access denied"));

        // Sanitize and update only the safe, editable fields
        if (updateDto.name() != null) {
            liability.setName(sanitizationService.sanitize(updateDto.name()));
        }
        if (updateDto.interestRate() != null) {
            liability.setInterestRate(updateDto.interestRate());
        }
        if (updateDto.description() != null) {
            liability.setDescription(sanitizationService.sanitize(updateDto.description()));
        }
        if (updateDto.customFields() != null) {
            liability.setCustomFields(sanitizationService.sanitizeMap(updateDto.customFields()));
        }

        Liability savedLiability = liabilityRepository.save(liability);
        return toDto(savedLiability);
    }

    public void deleteLiability(UUID liabilityId) {
        liabilityRepository.deleteById(liabilityId);
    }

    private LiabilityDto toDto(Liability liability) {
        return new LiabilityDto(
                liability.getId(),
                liability.getName(),
                liability.getType(),
                liability.getCurrency(),
                liability.getInitialAmount(),
                liability.getCurrentBalance(),
                liability.getInterestRate(),
                liability.getDescription(),
                liability.getCustomFields(),
                liability.getCreatedAt(),
                liability.getUpdatedAt());
    }
}
