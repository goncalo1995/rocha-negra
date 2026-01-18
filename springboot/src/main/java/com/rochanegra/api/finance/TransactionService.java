package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AssetService assetService;

    @Transactional
    public List<TransactionDto> createTransactions(List<TransactionCreateDto> createDtos, UUID userId) {
        return createDtos.stream()
                .map(dto -> createTransaction(dto, userId))
                .collect(Collectors.toList());
    }

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
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return toDto(transaction);
    }

    public void deleteTransaction(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

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

    public org.springframework.data.domain.Page<TransactionDto> getTransactions(
            UUID userId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            UUID categoryId,
            UUID assetId,
            org.springframework.data.domain.Pageable pageable) {

        org.springframework.data.jpa.domain.Specification<Transaction> spec = createSpecification(userId, startDate,
                endDate, categoryId, assetId);
        org.springframework.data.domain.Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        return page.map(this::toDto);
    }

    // Deprecated or removed, kept for now if used elsewhere, but redirected to
    // filtered
    public List<TransactionDto> getTransactionsForUser(UUID userId) {
        return getTransactions(userId, null, null, null, null, org.springframework.data.domain.Pageable.unpaged())
                .getContent();
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