package com.rochanegra.api.finance.liabilities;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.rochanegra.api.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class LiabilityService {

    private final LiabilityRepository liabilityRepository;

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

    public LiabilityDto updateLiability(UUID liabilityId, LiabilityCreateDto updateDto) {
        Liability liability = liabilityRepository.findById(liabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Liability not found"));

        if (updateDto.name() != null)
            liability.setName(updateDto.name());
        if (updateDto.type() != null)
            liability.setType(updateDto.type());
        if (updateDto.currency() != null)
            liability.setCurrency(updateDto.currency());
        if (updateDto.initialAmount() != null)
            liability.setInitialAmount(updateDto.initialAmount());
        if (updateDto.currentBalance() != null)
            liability.setCurrentBalance(updateDto.currentBalance());
        if (updateDto.interestRate() != null)
            liability.setInterestRate(updateDto.interestRate());
        if (updateDto.description() != null)
            liability.setDescription(updateDto.description());
        if (updateDto.customFields() != null)
            liability.setCustomFields(updateDto.customFields());

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
