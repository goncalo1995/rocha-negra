package com.rochanegra.api.modules.finance.transactions;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.rochanegra.api.common.core.PageDto;

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
    public ResponseEntity<PageDto<TransactionDto>> getTransactions(
            Authentication authentication,
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID assetId,
            @PageableDefault(sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        UUID userId = UUID.fromString(authentication.getName());
        PageDto<TransactionDto> pageDto = transactionService.getTransactions(userId, startDate, endDate, categoryId,
                assetId, pageable);
        return ResponseEntity.ok(pageDto);
    }

    @GetMapping("/{id}")
    public TransactionDto getTransaction(@PathVariable UUID id) {
        return transactionService.getTransaction(id);
    }

    @PatchMapping("/{id}")
    public TransactionDto updateTransaction(@PathVariable UUID id, @Valid @RequestBody TransactionUpdateDto updateDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return transactionService.updateTransaction(id, updateDto, userId);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        transactionService.deleteTransaction(id, userId);
    }
}