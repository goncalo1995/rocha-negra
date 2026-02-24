package com.rochanegra.api.modules.network;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.common.exception.ResourceNotFoundException;
import com.rochanegra.api.modules.dashboard.dtos.NetworkWidgetDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContactService {
    private final ContactRepository contactRepository;

    public NetworkWidgetDto getNetworkWidget(UUID userId) {

        List<Contact> contacts = contactRepository.findTop3ByUserId(userId);

        return new NetworkWidgetDto(
                contactRepository.countByUserId(userId),
                contacts.stream()
                        .map(ContactDto::fromEntity)
                        .toList());
    }

    public List<ContactDto.Detail> getAll(UUID userId) {
        return contactRepository.findAllByUserIdOrderByFirstNameAsc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ContactDto.Detail getById(UUID id, UUID userId) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        return toDto(contact);
    }

    @Transactional
    public ContactDto.Detail create(ContactDto.Create dto, UUID userId) {
        Contact contact = new Contact();
        contact.setUserId(userId);
        updateFromDto(contact, dto);
        return toDto(contactRepository.save(contact));
    }

    @Transactional
    public ContactDto.Detail update(UUID id, ContactDto.Update dto, UUID userId) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        updateFromDto(contact, dto);
        return toDto(contactRepository.save(contact));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        if (!contactRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contact not found");
        }
        contactRepository.deleteById(id);
    }

    private void updateFromDto(Contact contact, ContactDto.Create dto) {
        contact.setFirstName(dto.firstName());
        contact.setLastName(dto.lastName());
        contact.setEmail(dto.email());
        contact.setPhone(dto.phone());
        contact.setCompany(dto.company());
        contact.setRole(dto.role());
        contact.setCategory(dto.category() != null ? dto.category() : Contact.ContactCategory.professional);
        contact.setNotes(dto.notes());
        contact.setLinkedinUrl(dto.linkedinUrl());
        contact.setAvatarUrl(dto.avatarUrl());
    }

    private void updateFromDto(Contact contact, ContactDto.Update dto) {
        if (dto.firstName() != null)
            contact.setFirstName(dto.firstName());
        if (dto.lastName() != null)
            contact.setLastName(dto.lastName());
        if (dto.email() != null)
            contact.setEmail(dto.email());
        if (dto.phone() != null)
            contact.setPhone(dto.phone());
        if (dto.company() != null)
            contact.setCompany(dto.company());
        if (dto.role() != null)
            contact.setRole(dto.role());
        if (dto.category() != null)
            contact.setCategory(dto.category());
        if (dto.notes() != null)
            contact.setNotes(dto.notes());
        if (dto.linkedinUrl() != null)
            contact.setLinkedinUrl(dto.linkedinUrl());
        if (dto.avatarUrl() != null)
            contact.setAvatarUrl(dto.avatarUrl());
    }

    private ContactDto.Detail toDto(Contact c) {
        return new ContactDto.Detail(
                c.getId(),
                c.getFirstName(),
                c.getLastName(),
                c.getEmail(),
                c.getPhone(),
                c.getCompany(),
                c.getRole(),
                c.getCategory(),
                c.getNotes(),
                c.getLinkedinUrl(),
                c.getAvatarUrl(),
                c.getCreatedAt());
    }
}
