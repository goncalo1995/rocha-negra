package com.rochanegra.api.modules.finance.transactions;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.common.core.PageDto;
import com.rochanegra.api.common.exception.ResourceNotFoundException;
import com.rochanegra.api.modules.finance.assets.Asset;
import com.rochanegra.api.modules.finance.assets.AssetRepository;
import com.rochanegra.api.modules.finance.services.CurrencyConversionService;
import com.rochanegra.api.modules.finance.types.TransactionType;
import com.rochanegra.api.modules.links.EntityLinkDto;
import com.rochanegra.api.modules.links.LinkCreateDto;
import com.rochanegra.api.modules.links.LinkService;
import com.rochanegra.api.modules.preferences.UserPreferencesService;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;
    private final CurrencyConversionService conversionService;
    private final UserPreferencesService preferencesService;
    private final LinkService linkService;

    public List<TransactionDto> createTransactions(List<TransactionCreateDto> createDtos, UUID userId) {
        return createDtos.stream()
                .map(dto -> createTransaction(dto, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionDto createTransaction(TransactionCreateDto createDto, UUID userId) {
        return createTransactionInternal(createDto, null, userId); // null generatorId for manual transactions
    }

    @Transactional
    public TransactionDto createTransactionFromGenerator(TransactionCreateDto createDto, UUID generatorId,
            UUID userId) {
        return createTransactionInternal(createDto, generatorId, userId);
    }

    // --- PRIVATE IMPLEMENTATION ---
    private TransactionDto createTransactionInternal(TransactionCreateDto createDto, UUID generatorId, UUID userId) {
        // 1. Determine type and correct amount sign
        TransactionType type = createDto.type();
        BigDecimal correctedAmountOriginal = createDto.amountOriginal().abs();
        if (type == TransactionType.expense || type == TransactionType.transfer) {
            correctedAmountOriginal = correctedAmountOriginal.negate();
        }

        // 2. Calculate base amount for reporting
        String baseCurrency = preferencesService.getBaseCurrency(userId);
        BigDecimal amountBase = conversionService.convert(correctedAmountOriginal, createDto.currencyOriginal(),
                baseCurrency);
        BigDecimal exchangeRate = conversionService.getRate(baseCurrency, createDto.currencyOriginal());

        // 3. Create and Save the Transaction Entity
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setGeneratorId(generatorId);
        transaction.setType(type);
        transaction.setAmountOriginal(correctedAmountOriginal);
        transaction.setCurrencyOriginal(createDto.currencyOriginal());
        transaction.setAmountBase(amountBase);
        transaction.setExchangeRate(exchangeRate);
        transaction.setDescription(createDto.description());
        transaction.setDate(createDto.date());
        transaction.setCategoryId(createDto.categoryId());
        transaction.setAssetId(createDto.assetId());
        transaction.setDestinationAssetId(createDto.destinationAssetId());
        transaction.setAttachmentUrl(createDto.attachmentUrl());
        transaction.setCustomFields(createDto.customFields());
        Transaction savedTx = transactionRepository.save(transaction);

        // 4. Apply the financial impact using the single source of truth method
        applyBalancesForTransaction(savedTx);

        // 5. Create any entity links
        createLinksForTransaction(savedTx, createDto.links(), userId);

        return toDto(savedTx);
    }

    public TransactionDto getTransaction(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return toDto(transaction);
    }

    public List<TransactionDto> getRecentTransactions(UUID userId, int limit) {
        return transactionRepository.findTopNByUserIdOrderByDateDesc(userId, limit)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void deleteTransaction(UUID transactionId, UUID userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Revert the balance changes by passing the negated amount
        updateBalancesForTransaction(transaction, true); // true = isReverting

        transactionRepository.delete(transaction);
    }

    @Transactional
    public TransactionDto updateTransaction(UUID id, TransactionUpdateDto updateDto, UUID userId) {
        // 1. Fetch the original transaction and verify ownership
        Transaction transaction = transactionRepository.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // === STEP A: REVERT the financial impact of the OLD transaction ===
        revertBalancesForTransaction(transaction);

        // === STEP B: UPDATE the transaction entity with the new details ===
        // Use the new values from the DTO, falling back to the old values if not
        // provided.
        // Use new values from the DTO, falling back to the old values if not provided.
        transaction.setDescription(
                updateDto.description() != null ? updateDto.description() : transaction.getDescription());
        transaction.setDate(updateDto.date() != null ? updateDto.date() : transaction.getDate());
        transaction
                .setCategoryId(updateDto.categoryId() != null ? updateDto.categoryId() : transaction.getCategoryId());
        transaction.setAssetId(updateDto.assetId() != null ? updateDto.assetId() : transaction.getAssetId());
        transaction.setDestinationAssetId(updateDto.destinationAssetId() != null ? updateDto.destinationAssetId()
                : transaction.getDestinationAssetId());
        transaction.setAmountOriginal(
                updateDto.amountOriginal() != null ? updateDto.amountOriginal() : transaction.getAmountOriginal());
        transaction.setCurrencyOriginal(updateDto.currencyOriginal() != null ? updateDto.currencyOriginal()
                : transaction.getCurrencyOriginal());

        // Recalculate the 'type' and 'amountBase' based on the potentially new values
        TransactionType newType = determineTypeFromAmountAndDestination(transaction.getAmountOriginal(),
                transaction.getDestinationAssetId());
        transaction.setType(newType);

        String baseCurrency = preferencesService.getBaseCurrency(userId);
        BigDecimal newAmountBase = conversionService.convert(transaction.getAmountOriginal(),
                transaction.getCurrencyOriginal(), baseCurrency);
        transaction.setAmountBase(newAmountBase);

        BigDecimal newExchangeRate = conversionService.getRate(baseCurrency, transaction.getCurrencyOriginal());
        transaction.setExchangeRate(newExchangeRate);

        // === STEP C: RE-APPLY the financial impact of the NEW, updated transaction ===
        applyBalancesForTransaction(transaction);

        // Save the now-updated transaction entity
        Transaction savedTx = transactionRepository.save(transaction);
        return toDto(savedTx);
    }

    // --- NEW PRIVATE HELPER METHODS for clarity ---

    /** Reverts the balance changes caused by a transaction. */
    private void revertBalancesForTransaction(Transaction transaction) {
        Transaction negated = new Transaction();
        // Invert the amount
        negated.setAmountOriginal(transaction.getAmountOriginal().negate());
        // Copy all other relevant properties
        negated.setCurrencyOriginal(transaction.getCurrencyOriginal());
        negated.setAssetId(transaction.getAssetId());
        negated.setDestinationAssetId(transaction.getDestinationAssetId());
        // negated.setCustomFields(transaction.getCustomFields());

        // Apply the inverted financial impact
        applyBalancesForTransaction(negated);
    }

    /** Applies the balance changes for a given transaction. */
    private void applyBalancesForTransaction(Transaction transaction) {
        // --- Primary Asset Logic ---
        if (transaction.getAssetId() != null) {
            Asset primaryAsset = assetRepository.findById(transaction.getAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Primary asset for transaction not found"));

            // Get the change amount. For a transfer, the primary asset is always the source
            // (negative change).
            BigDecimal changeAmount = transaction.getAmountOriginal();

            if (primaryAsset.getBalance() != null) { // It's a currency-based asset
                BigDecimal balanceChange = conversionService.convert(
                        changeAmount,
                        transaction.getCurrencyOriginal(),
                        primaryAsset.getCurrency());
                BigDecimal currentBalance = primaryAsset.getBalance() != null ? primaryAsset.getBalance()
                        : BigDecimal.ZERO;
                primaryAsset.setBalance(currentBalance.add(balanceChange));
                assetRepository.save(primaryAsset);

            } else if (primaryAsset.getQuantity() != null) { // It's a unit-based asset
                if (!transaction.getCurrencyOriginal().equalsIgnoreCase(primaryAsset.getCurrency())) {
                    throw new IllegalArgumentException(
                            "Transaction currency must match the unit-based asset's currency");
                }
                BigDecimal currentQuantity = primaryAsset.getQuantity() != null ? primaryAsset.getQuantity()
                        : BigDecimal.ZERO;
                primaryAsset.setQuantity(currentQuantity.add(transaction.getAmountOriginal()));
                assetRepository.save(primaryAsset);
            }
        }

        // --- Destination Asset Logic (for Transfers) ---
        if (transaction.getType() == TransactionType.transfer && transaction.getDestinationAssetId() != null) {
            Asset destAsset = assetRepository.findById(transaction.getDestinationAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination asset for transaction not found"));

            // The destination always receives a positive amount
            BigDecimal positiveAmount = transaction.getAmountOriginal().abs();

            if (destAsset.getBalance() != null) {
                BigDecimal balanceChange = conversionService.convert(
                        positiveAmount,
                        transaction.getCurrencyOriginal(),
                        destAsset.getCurrency());
                BigDecimal currentBalance = destAsset.getBalance() != null ? destAsset.getBalance() : BigDecimal.ZERO;
                destAsset.setBalance(currentBalance.add(balanceChange));
                assetRepository.save(destAsset);

            } else if (destAsset.getQuantity() != null) {
                if (!transaction.getCurrencyOriginal().equalsIgnoreCase(destAsset.getCurrency())) {
                    throw new IllegalArgumentException(
                            "Transfer currency must match the unit-based destination asset's currency");
                }
                BigDecimal currentQuantity = destAsset.getQuantity() != null ? destAsset.getQuantity()
                        : BigDecimal.ZERO;
                destAsset.setQuantity(currentQuantity.add(positiveAmount));
                assetRepository.save(destAsset);
            }
        }

        // --- Liability Logic ---
        // You would find linked liabilities using your 'transaction_links' table.
        // For V1, we can simplify: if a transaction's description contains "Loan
        // Payment", for example.
        // A better way is to pass the liabilityId in the DTO's customFields.
        // Let's assume a 'liabilityId' can be passed in customFields for now.

        // UUID liabilityId =
        // getLiabilityIdFromCustomFields(transaction.getCustomFields());
        // if (liabilityId != null) {
        // Liability liability =
        // liabilityRepository.findById(liabilityId).orElseThrow(...);
        // // A payment reduces the liability balance, so we add a negative amount.
        // BigDecimal liabilityChange =
        // conversionService.convert(transaction.getAmountOriginal(), ...);
        // liability.setCurrentBalance(liability.getCurrentBalance().add(liabilityChange));
        // liabilityRepository.save(liability);
        // }
    }

    // A new helper for determining type
    private TransactionType determineTypeFromAmountAndDestination(BigDecimal amount, UUID destinationId) {
        if (destinationId != null)
            return TransactionType.transfer;
        return amount.signum() >= 0 ? TransactionType.income : TransactionType.expense;
    }

    public PageDto<TransactionDto> getTransactions(
            UUID userId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            UUID categoryId,
            UUID assetId,
            org.springframework.data.domain.Pageable pageable) {

        Specification<Transaction> spec = createSpecification(userId, startDate,
                endDate, categoryId, assetId);
        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        // Manually map the Page object to your PageDto
        List<TransactionDto> content = page.getContent().stream().map(this::toDto).collect(Collectors.toList());

        // remove duplicates
        content = content.stream().distinct().collect(Collectors.toList());

        return new PageDto<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }

    private org.springframework.data.jpa.domain.Specification<Transaction> createSpecification(
            UUID userId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            UUID categoryId,
            UUID assetId) {
        return (root, query, criteriaBuilder) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("userId"), userId));

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("date"), startDate));
            }
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("date"), endDate));
            }
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("categoryId"), categoryId));
            }
            if (assetId != null) {
                predicates.add(criteriaBuilder.equal(root.get("assetId"), assetId));
            }

            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private void createLinksForTransaction(Transaction transaction, List<EntityLinkDto> linksToCreate, UUID userId) {
        if (linksToCreate == null || linksToCreate.isEmpty()) {
            return;
        }

        for (EntityLinkDto linkInfo : linksToCreate) {
            LinkCreateDto linkDto = new LinkCreateDto(
                    transaction.getId(), "transaction",
                    linkInfo.entityId(), linkInfo.entityType(),
                    "FOR" // Or another relation type
            );
            linkService.createLink(linkDto, userId);
        }
    }

    private void updateBalancesForTransaction(Transaction transaction, boolean isReverting) {
        // Determine the sign multiplier. If we are reverting, flip the signs.
        BigDecimal sign = isReverting ? new BigDecimal("-1") : BigDecimal.ONE;

        // Update the primary asset
        if (transaction.getAssetId() != null) {
            Asset primaryAsset = assetRepository.findById(transaction.getAssetId()).orElseThrow();

            // The change is always based on the original amount.
            // For an expense/transfer, this is already negative.
            BigDecimal changeAmount = transaction.getAmountOriginal().multiply(sign);

            if (primaryAsset.getBalance() != null) {
                BigDecimal balanceChange = conversionService.convert(changeAmount, transaction.getCurrencyOriginal(),
                        primaryAsset.getCurrency());
                // BigDecimal changeInAssetCurrency = conversionService.convert(amount,
                // preferencesService.getBaseCurrency(transaction.getUserId()),
                // primaryAsset.getCurrency());
                BigDecimal currentBalance = primaryAsset.getBalance() != null ? primaryAsset.getBalance()
                        : BigDecimal.ZERO;
                primaryAsset.setBalance(currentBalance.add(balanceChange));
                assetRepository.save(primaryAsset);
            } else if (primaryAsset.getQuantity() != null) {
                // FIXME
                // BigDecimal quantityChange =
                // changeAmount.divide(primaryAsset.getConversionRate(),
                // BigDecimal.ROUND_HALF_UP);
                // BigDecimal currentQuantity = primaryAsset.getQuantity() != null ?
                // primaryAsset.getQuantity()
                // : BigDecimal.ZERO;
                // primaryAsset.setQuantity(currentQuantity.add(quantityChange));
                // assetRepository.save(primaryAsset);
            }
        }

        // Update destination asset for transfers
        if (transaction.getDestinationAssetId() != null) {
            Asset destAsset = assetRepository.findById(transaction.getDestinationAssetId()).orElseThrow(/* ... */);

            // The destination always receives a positive amount, so we use .abs()
            BigDecimal positiveAmount = transaction.getAmountOriginal().abs().multiply(sign);

            if (destAsset.getBalance() != null) {
                BigDecimal balanceChange = conversionService.convert(positiveAmount, transaction.getCurrencyOriginal(),
                        destAsset.getCurrency());
                BigDecimal currentBalance = destAsset.getBalance() != null ? destAsset.getBalance() : BigDecimal.ZERO;
                destAsset.setBalance(currentBalance.add(balanceChange));
                assetRepository.save(destAsset);
            } // ... FIXME else if quantity ...
        }

        // You would add similar logic here for updating Liability balances if a
        // transaction is linked to one
    }

    private TransactionDto toDto(Transaction transaction) {
        return new TransactionDto(
                transaction.getId(),
                transaction.getGeneratorId(),
                transaction.getAmountOriginal(),
                transaction.getCurrencyOriginal(),
                transaction.getAmountBase(),
                transaction.getExchangeRate(),
                transaction.getDescription(),
                transaction.getDate(),
                transaction.getType(),
                transaction.getCategoryId(),
                transaction.getAssetId(),
                transaction.getDestinationAssetId(),
                transaction.getAttachmentUrl(),
                transaction.getCustomFields(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt());
    }
}