package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
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

    @GetMapping
    public ResponseEntity<List<RecurringRuleDto>> getMyRules(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(recurringRuleService.getRulesForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringRuleDto> getRule(@PathVariable UUID id) {
        return ResponseEntity.ok(recurringRuleService.getRecurringRule(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RecurringRuleDto> updateRule(@PathVariable UUID id,
            @Valid @RequestBody RecurringRuleCreateDto updateDto) {
        return ResponseEntity.ok(recurringRuleService.updateRecurringRule(id, updateDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable UUID id) {
        recurringRuleService.deleteRecurringRule(id);
        return ResponseEntity.noContent().build();
    }
}