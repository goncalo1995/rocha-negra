package com.rochanegra.api.modules.finance.recurring;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.rochanegra.api.modules.finance.recurring.dto.GeneratorUpdateDto;
import com.rochanegra.api.modules.finance.recurring.dto.TemplateCreateDto;

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

    // @PatchMapping("/{ruleId}")
    // public ResponseEntity<RecurringRuleDto> updateRecurringRule(
    // @PathVariable UUID ruleId,
    // @RequestBody @Valid RecurringRuleUpdateDto updateDto,
    // Authentication authentication) {
    // UUID userId = UUID.fromString(authentication.getName());
    // RecurringRuleDto updatedRule = recurringRuleService.updateRule(ruleId,
    // updateDto, userId);
    // return ResponseEntity.ok(updatedRule);
    // }

    /**
     * Endpoint for simple updates to the generator itself (description, frequency,
     * etc.)
     */
    @PatchMapping("/{generatorId}")
    public ResponseEntity<RecurringRuleDto> updateGeneratorDetails(
            @PathVariable UUID generatorId,
            @RequestBody GeneratorUpdateDto updateDto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(recurringRuleService.updateGeneratorDetails(generatorId, updateDto, userId));
    }

    /** Endpoint to change the financial details by creating a NEW template. */
    @PostMapping("/{generatorId}/templates")
    public ResponseEntity<RecurringRuleDto> addNewTemplate(
            @PathVariable UUID generatorId,
            @RequestBody TemplateCreateDto templateDto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringRuleService.addNewTemplate(generatorId, templateDto, userId));
    }
}