package com.rochanegra.api.modules.network;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<List<ContactDto.Detail>> getAll(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(contactService.getAll(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactDto.Detail> getById(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(contactService.getById(id, userId));
    }

    @PostMapping
    public ResponseEntity<ContactDto.Detail> create(@RequestBody ContactDto.Create dto, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return new ResponseEntity<>(contactService.create(dto, userId), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ContactDto.Detail> update(@PathVariable UUID id, @RequestBody ContactDto.Update dto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(contactService.update(id, dto, userId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        contactService.delete(id, userId);
    }
}
