package com.rochanegra.api.modules.network;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class ContactControllerTest {

    @Mock
    private ContactService contactService;

    @InjectMocks
    private ContactController contactController;

    @Mock
    private Authentication authentication;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        when(authentication.getName()).thenReturn(userId.toString());
    }

    @Test
    void getAll_ReturnsOkAndList() {
        ContactDto.Detail contact = new ContactDto.Detail(
                UUID.randomUUID(), "John", "Doe", "john@example.com", null, null, null,
                Contact.ContactCategory.professional, null, null, null, Instant.now());

        when(contactService.getAll(userId)).thenReturn(Collections.singletonList(contact));

        ResponseEntity<List<ContactDto.Detail>> response = contactController.getAll(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("John", response.getBody().get(0).firstName());
        verify(contactService).getAll(userId);
    }

    @Test
    void create_ReturnsCreatedAndDto() {
        ContactDto.Create createDto = new ContactDto.Create(
                "Jane", "Doe", null, null, null, null, null, null, null, null);
        ContactDto.Detail savedContact = new ContactDto.Detail(
                UUID.randomUUID(), "Jane", "Doe", null, null, null, null,
                Contact.ContactCategory.professional, null, null, null, Instant.now());

        when(contactService.create(any(ContactDto.Create.class), eq(userId))).thenReturn(savedContact);

        ResponseEntity<ContactDto.Detail> response = contactController.create(createDto, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Jane", response.getBody().firstName());
        verify(contactService).create(createDto, userId);
    }
}
