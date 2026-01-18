package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recurring-rules")
@RequiredArgsConstructor
public class RecurringRuleController {

    private final RecurringRuleService recurringRuleService;

    @GetMapping
    public ResponseEntity<List<RecurringRuleDto>> getMyRecurringRules(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<RecurringRuleDto> rules = recurringRuleService.getRulesForUser(userId);
        return ResponseEntity.ok(rules);
    }
}