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
        return toDto(savedTransaction);
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