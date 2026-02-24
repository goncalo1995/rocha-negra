package com.rochanegra.api.modules.network;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.rochanegra.api.common.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    private UUID userId;
    private UUID contactId;
    private Contact contact;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        contactId = UUID.randomUUID();

        contact = new Contact();
        contact.setId(contactId);
        contact.setUserId(userId);
        contact.setFirstName("John");
        contact.setLastName("Doe");
    }

    @Test
    void getById_WhenFound_ReturnsDto() {
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));

        ContactDto.Detail result = contactService.getById(contactId, userId);

        assertNotNull(result);
        assertEquals("John", result.firstName());
        verify(contactRepository).findById(contactId);
    }

    @Test
    void getById_WhenNotFound_ThrowsException() {
        when(contactRepository.findById(contactId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contactService.getById(contactId, userId));
    }

    @Test
    void create_SavesAndReturnsDto() {
        ContactDto.Create createDto = new ContactDto.Create(
                "Jane", "Doe", "jane@example.com", null, null, null,
                Contact.ContactCategory.personal, null, null, null);

        when(contactRepository.save(any(Contact.class))).thenAnswer(invocation -> {
            Contact saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        ContactDto.Detail result = contactService.create(createDto, userId);

        assertNotNull(result);
        assertEquals("Jane", result.firstName());
        verify(contactRepository).save(any(Contact.class));
    }
}
