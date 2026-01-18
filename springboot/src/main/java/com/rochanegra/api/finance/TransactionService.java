package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AssetService assetService;

    public TransactionDto createTransaction(TransactionCreateDto createDto, UUID userId) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAmount(createDto.amount());
        transaction.setDescription(createDto.description());
        transaction.setDate(createDto.date());
        transaction.setType(createDto.type());
        transaction.setCategoryId(createDto.categoryId());
        transaction.setAssetId(createDto.assetId());

        Transaction savedTransaction = transactionRepository.save(transaction);

        if (createDto.assetId() != null) {
            assetService.updateBalance(createDto.assetId(), createDto.amount(), createDto.type());
        }

        return toDto(savedTransaction);
    }

    public TransactionDto getTransaction(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return toDto(transaction);
    }

    public void deleteTransaction(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Revert asset balance
        if (transaction.getAssetId() != null) {
            // If it was income, we subtract. If expense, we add.
            // We can reuse updateBalance but invert the amount logic or type.
            // Simpler: pass NEGATED amount with SAME type.
            // updateBalance(income, -100) -> adds -100 = subtract 100.
            // updateBalance(expense, -100) -> subtracts -100 = adds 100.
            assetService.updateBalance(transaction.getAssetId(), transaction.getAmount().negate(),
                    transaction.getType());
        }

        transactionRepository.delete(transaction);
    }

    public TransactionDto updateTransaction(UUID id, TransactionCreateDto updateDto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Revert old asset balance
        if (transaction.getAssetId() != null) {
            assetService.updateBalance(transaction.getAssetId(), transaction.getAmount().negate(),
                    transaction.getType());
        }

        // Update fields
        if (updateDto.amount() != null)
            transaction.setAmount(updateDto.amount());
        if (updateDto.description() != null)
            transaction.setDescription(updateDto.description());
        if (updateDto.date() != null)
            transaction.setDate(updateDto.date());
        if (updateDto.type() != null)
            transaction.setType(updateDto.type()); // Careful if type changes logic
        if (updateDto.categoryId() != null)
            transaction.setCategoryId(updateDto.categoryId());

        // Asset ID Update logic is tricky if asset changes.
        // For now assuming asset is updated or kept.
        // But if updateDto.assetId() is passed (even transparently), we set it.
        // Assuming the DTO has all fields or partial? "TransactionCreateDto" is a
        // record with ALL fields.
        // If the user sends partial JSON, the record fields might be null.
        // But standard PATCH usually expects map or checked nulls.
        // Here we checked nulls.
        // However, if assetId is explicitly changed:
        if (updateDto.assetId() != null)
            transaction.setAssetId(updateDto.assetId());

        // Apply NEW asset balance
        if (transaction.getAssetId() != null) {
            assetService.updateBalance(transaction.getAssetId(), transaction.getAmount(), transaction.getType());
        }

        Transaction saved = transactionRepository.save(transaction);
        return toDto(saved);
    }

    public List<TransactionDto> getTransactionsForUser(UUID userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TransactionDto toDto(Transaction transaction) {
        return new TransactionDto(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getDate(),
                transaction.getType(),
                transaction.getCategoryId(),
                transaction.getAssetId(),
                transaction.getCreatedAt());
    }
}