package com.rochanegra.api.finance.transactions;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.core.PageDto;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.assets.Asset;
import com.rochanegra.api.finance.assets.AssetRepository;
import com.rochanegra.api.finance.assets.AssetService;
import com.rochanegra.api.finance.preferences.UserPreferencesService;
import com.rochanegra.api.finance.services.CurrencyConversionService;
import com.rochanegra.api.finance.types.TransactionType;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;
    private final AssetService assetService;
    private final CurrencyConversionService conversionService;
    private final UserPreferencesService preferencesService;

    @Transactional
    public List<TransactionDto> createTransactions(List<TransactionCreateDto> createDtos, UUID userId) {
        return createDtos.stream()
                .map(dto -> createTransaction(dto, userId))
                .collect(Collectors.toList());
    }

    public TransactionDto createTransaction(TransactionCreateDto createDto, UUID userId) {
        // 1. Get User's Base Currency for reporting
        String baseCurrency = preferencesService.getBaseCurrency(userId);
        TransactionType type = determineTransactionType(createDto); // (income, expense, transfer)

        // 2. Fetch the Primary Asset to understand the context
        Asset primaryAsset = assetRepository.findById(createDto.assetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        // --- LOGIC FOR UPDATING ASSET VALUE ---
        // This is the core logic that replaces the old updateBalance method
        if (primaryAsset.getBalance() != null) { // It's a currency-based asset (e.g., bank account)
            // 3. Determine the Exchange Rate to use
            // The rate we need is between the transaction's currency and the asset's
            // currency.
            BigDecimal rate = conversionService.getRate(createDto.currencyOriginal(), primaryAsset.getCurrency());
            // 4. Calculate the change in the ASSET's balance. This is the most important
            // calculation.
            // Example: Spent $10 USD (amountOriginal), rate is 0.92 EUR/USD, asset is in
            // EUR.
            // The asset's balance must change by -10.00 * 0.92 = -9.20 EUR.
            BigDecimal balanceChange = createDto.amountOriginal().multiply(rate);
            BigDecimal currentBalance = primaryAsset.getBalance() != null ? primaryAsset.getBalance() : BigDecimal.ZERO;
            primaryAsset.setBalance(currentBalance.add(balanceChange));
        } else if (primaryAsset.getQuantity() != null) { // It's a unit-based asset (e.g., crypto)
            // For unit-based assets, the amount *is* the change in quantity.
            // We assume the transaction currency matches the asset's unit (e.g., amount is
            // in "BTC").
            if (!createDto.currencyOriginal().equalsIgnoreCase(primaryAsset.getCurrency())) {
                throw new IllegalArgumentException("Transaction currency must match the unit-based asset's currency");
            }
            BigDecimal currentQuantity = primaryAsset.getQuantity() != null ? primaryAsset.getQuantity()
                    : BigDecimal.ZERO;
            primaryAsset.setQuantity(currentQuantity.add(createDto.amountOriginal()));
        }
        assetRepository.save(primaryAsset);

        // 6. Handle Transfers
        if (type == TransactionType.transfer && createDto.destinationAssetId() != null) {
            Asset destinationAsset = assetRepository.findById(createDto.destinationAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination asset not found"));

            // Use the absolute value of the original amount for the receiving end of a
            // transfer
            BigDecimal positiveAmountOriginal = createDto.amountOriginal().abs();

            if (destinationAsset.getBalance() != null) { // It's a currency-based asset
                BigDecimal rate = conversionService.getRate(createDto.currencyOriginal(),
                        destinationAsset.getCurrency());
                BigDecimal balanceChange = positiveAmountOriginal.multiply(rate); // Change is now positive

                BigDecimal currentBalance = destinationAsset.getBalance() != null ? destinationAsset.getBalance()
                        : BigDecimal.ZERO;
                destinationAsset.setBalance(currentBalance.add(balanceChange)); // Correctly adds to the balance

            } else if (destinationAsset.getQuantity() != null) { // It's a unit-based asset
                if (!createDto.currencyOriginal().equalsIgnoreCase(destinationAsset.getCurrency())) {
                    // This logic is more complex. For V1, we can enforce that transfer currencies
                    // must match for quantity assets.
                    // Or you'd need a crypto-to-crypto exchange rate.
                    throw new IllegalArgumentException(
                            "Cross-currency transfers for unit-based assets are not yet supported.");
                }
                BigDecimal currentQuantity = destinationAsset.getQuantity() != null ? destinationAsset.getQuantity()
                        : BigDecimal.ZERO;
                destinationAsset.setQuantity(currentQuantity.add(positiveAmountOriginal)); // Correctly adds to the
                                                                                           // quantity
            }
            assetRepository.save(destinationAsset);
        }

        // 7. For reporting, convert the original amount to the user's BASE currency.
        BigDecimal amountBase = conversionService.convert(
                createDto.amountOriginal(),
                createDto.currencyOriginal(),
                baseCurrency);
        BigDecimal exchangeRate = conversionService.getRate(baseCurrency, createDto.currencyOriginal());

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setGeneratorId(null); // This is a manual, one-off transaction

        transaction.setAmountOriginal(createDto.amountOriginal());
        transaction.setCurrencyOriginal(createDto.currencyOriginal());
        transaction.setAmountBase(amountBase);
        transaction.setDescription(createDto.description());
        transaction.setExchangeRate(exchangeRate);
        transaction.setDate(createDto.date());
        transaction.setType(type);
        transaction.setCategoryId(createDto.categoryId());
        transaction.setAssetId(createDto.assetId());
        transaction.setDestinationAssetId(createDto.destinationAssetId());
        transaction.setAttachmentUrl(createDto.attachmentUrl());
        transaction.setCustomFields(createDto.customFields());

        Transaction savedTransaction = transactionRepository.save(transaction);

        // if (createDto.assetId() != null) {
        // assetService.updateBalance(createDto.assetId(), createDto.amountOriginal(),
        // createDto.type());
        // }

        return toDto(savedTransaction);
    }

    /**
     * NEW METHOD: Specifically for creating a transaction generated by the
     * scheduler.
     * It includes the generatorId to create the link.
     */
    @Transactional
    public TransactionDto createTransactionFromGenerator(TransactionCreateDto createDto, UUID generatorId,
            UUID userId) {

        // This method can now just call the main create method, after setting the
        // generatorId
        // This requires a bit of refactoring, but for now let's keep it simple:
        String baseCurrency = preferencesService.getBaseCurrency(userId);
        BigDecimal amountBase = conversionService.convert(createDto.amountOriginal(), createDto.currencyOriginal(),
                baseCurrency);

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setGeneratorId(generatorId);

        // Map fields from DTO (same as above)
        transaction.setAmountOriginal(createDto.amountOriginal());
        transaction.setCurrencyOriginal(createDto.currencyOriginal());
        transaction.setAmountBase(amountBase);
        transaction.setDescription(createDto.description());
        transaction.setDate(createDto.date());
        transaction.setType(createDto.type());
        transaction.setCategoryId(createDto.categoryId());
        transaction.setAssetId(createDto.assetId());
        transaction.setDestinationAssetId(createDto.destinationAssetId());

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Here you would also add logic to UPDATE the associated Asset's balance
        // e.g., assetService.updateBalance(createDto.assetId(), createDto.amount());

        return toDto(savedTransaction);
    }

    public TransactionDto getTransaction(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return toDto(transaction);
    }

    public void deleteTransaction(UUID transactionId, UUID userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Revert the balance changes by passing the negated amount
        updateBalancesForTransaction(transaction, true); // true = isReverting

        // Revert asset balance
        // if (transaction.getAssetId() != null) {
        // If it was income, we subtract. If expense, we add.
        // We can reuse updateBalance but invert the amount logic or type.
        // Simpler: pass NEGATED amount with SAME type.
        // updateBalance(income, -100) -> adds -100 = subtract 100.
        // updateBalance(expense, -100) -> subtracts -100 = adds 100.
        // assetService.updateBalance(transaction.getAssetId(),
        // transaction.getAmountOriginal().negate(),
        // transaction.getType());
        // }

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

            if (primaryAsset.getBalance() != null) { // It's a currency-based asset
                BigDecimal balanceChange = conversionService.convert(
                        transaction.getAmountOriginal(),
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
        if (transaction.getDestinationAssetId() != null) {
            Asset destAsset = assetRepository.findById(transaction.getDestinationAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination asset for transaction not found"));

            // The amount for the destination is always the positive version of the original
            // amount
            BigDecimal positiveAmountOriginal = transaction.getAmountOriginal().abs();

            if (destAsset.getBalance() != null) {
                BigDecimal balanceChange = conversionService.convert(
                        positiveAmountOriginal,
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
                destAsset.setQuantity(currentQuantity.add(positiveAmountOriginal));
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

    private TransactionType determineTransactionType(TransactionCreateDto dto) {
        if (dto.destinationAssetId() != null) {
            return TransactionType.transfer;
        }
        // Amount can now be positive or negative from the DTO
        return dto.amountOriginal().signum() >= 0 ? TransactionType.income : TransactionType.expense;
    }

    // --- PRIVATE HELPER FOR BALANCE UPDATES ---
    private void updateBalancesForTransaction(Transaction transaction) {
        updateBalancesForTransaction(transaction, false);
    }

    private void updateBalancesForTransaction(Transaction transaction, boolean isReverting) {
        BigDecimal amount = transaction.getAmountBase(); // Always use the base amount for consistency
        if (isReverting) {
            amount = amount.negate();
        }

        // Update the primary asset
        if (transaction.getAssetId() != null) {
            Asset primaryAsset = assetRepository.findById(transaction.getAssetId()).orElseThrow();

            BigDecimal changeInAssetCurrency = conversionService.convert(amount,
                    preferencesService.getBaseCurrency(transaction.getUserId()), primaryAsset.getCurrency());

            // GUARD: Get current balance or default to ZERO
            BigDecimal currentBalance = primaryAsset.getBalance() != null ? primaryAsset.getBalance() : BigDecimal.ZERO;

            if (transaction.getType() == TransactionType.income) {
                primaryAsset.setBalance(currentBalance.add(changeInAssetCurrency));
            } else { // Expense or Transfer-out
                primaryAsset.setBalance(currentBalance.subtract(changeInAssetCurrency));
            }
            assetRepository.save(primaryAsset);
        }

        // Update destination asset for transfers
        if (transaction.getDestinationAssetId() != null) {
            Asset destAsset = assetRepository.findById(transaction.getDestinationAssetId()).orElseThrow();
            BigDecimal changeInDestCurrency = conversionService.convert(amount,
                    preferencesService.getBaseCurrency(transaction.getUserId()), destAsset.getCurrency());

            // GUARD: Get current balance or default to ZERO
            BigDecimal currentBalance = destAsset.getBalance() != null ? destAsset.getBalance() : BigDecimal.ZERO;

            destAsset.setBalance(currentBalance.add(changeInDestCurrency)); // Always adds
            assetRepository.save(destAsset);
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