package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@Valid @RequestBody TransactionCreateDto createDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        TransactionDto newTransaction = transactionService.createTransaction(createDto, userId);
        return new ResponseEntity<>(newTransaction, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<java.util.List<TransactionDto>> createTransactions(
            @RequestBody java.util.List<TransactionCreateDto> createDtos,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        java.util.List<TransactionDto> newTransactions = transactionService.createTransactions(createDtos, userId);
        return new ResponseEntity<>(newTransactions, HttpStatus.CREATED);
    }

    @GetMapping
    public org.springframework.data.domain.Page<TransactionDto> getTransactions(
            Authentication authentication,
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID assetId,
            org.springframework.data.domain.Pageable pageable) {

        UUID userId = UUID.fromString(authentication.getName());
        return transactionService.getTransactions(userId, startDate, endDate, categoryId, assetId, pageable);
    }

    @GetMapping("/{id}")
    public TransactionDto getTransaction(@PathVariable UUID id) {
        return transactionService.getTransaction(id);
    }

    @PatchMapping("/{id}")
    public TransactionDto updateTransaction(@PathVariable UUID id, @Valid @RequestBody TransactionCreateDto updateDto) {
        return transactionService.updateTransaction(id, updateDto);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
    }
}