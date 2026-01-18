package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@RequestBody TransactionCreateDto createDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        TransactionDto newTransaction = transactionService.createTransaction(createDto, userId);
        return new ResponseEntity<>(newTransaction, HttpStatus.CREATED);
    }

    @GetMapping
    public List<TransactionDto> getTransactions(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return transactionService.getTransactionsForUser(userId);
    }

    @GetMapping("/{id}")
    public TransactionDto getTransaction(@PathVariable UUID id) {
        return transactionService.getTransaction(id);
    }

    @PatchMapping("/{id}")
    public TransactionDto updateTransaction(@PathVariable UUID id, @RequestBody TransactionCreateDto updateDto) {
        return transactionService.updateTransaction(id, updateDto);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
    }
}