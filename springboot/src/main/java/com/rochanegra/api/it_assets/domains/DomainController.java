package com.rochanegra.api.it_assets.domains;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.rochanegra.api.it_assets.domains.dto.DomainCreateDto;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/domains")
@RequiredArgsConstructor
public class DomainController {

    private final DomainService domainService;

    @GetMapping
    public ResponseEntity<List<DomainDto>> getMyDomains(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<DomainDto> domains = domainService.getAllDomains(userId);
        return ResponseEntity.ok(domains);
    }

    @PostMapping
    public ResponseEntity<DomainDto> createDomain(@Valid @RequestBody DomainCreateDto createDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        DomainDto newDomain = domainService.createDomain(createDto, userId);
        return new ResponseEntity<>(newDomain, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DomainDto> getDomain(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(domainService.getDomainById(id, userId));
    }

    // @PatchMapping("/{id}")
    // public ResponseEntity<DomainDto> updateDomain(@PathVariable UUID id,
    // @Valid @RequestBody DomainCreateDto updateDto) {
    // return ResponseEntity.ok(domainService.updateDomain(id, updateDto));
    // }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDomain(@PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        domainService.deleteDomain(id, userId);
        return ResponseEntity.noContent().build();
    }
}
