package com.rochanegra.api.finance.recurring;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recurring-rules")
@RequiredArgsConstructor
public class RecurringRuleController {

    private final RecurringRuleService recurringRuleService;

    @PostMapping
    public ResponseEntity<RecurringRuleDto> createRecurringRule(
            @RequestBody @Valid RecurringRuleCreateDto createDto, // Add @Valid for validation
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        RecurringRuleDto newRule = recurringRuleService.createRule(createDto, userId);
        return new ResponseEntity<>(newRule, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RecurringRuleDto>> getMyRules(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(recurringRuleService.getRulesForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringRuleDto> getRule(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(recurringRuleService.getRuleById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        recurringRuleService.deleteRule(id, userId);
        return ResponseEntity.noContent().build();
    }
}