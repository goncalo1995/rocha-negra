package com.rochanegra.api.network;

import java.time.Instant;
import java.util.UUID;

public class ContactDto {
    public record Detail(
            UUID id,
            String firstName,
            String lastName,
            String email,
            String phone,
            String company,
            String role,
            Contact.ContactCategory category,
            String notes,
            String linkedinUrl,
            String avatarUrl,
            Instant createdAt) {
    }

    public record Create(
            String firstName,
            String lastName,
            String email,
            String phone,
            String company,
            String role,
            Contact.ContactCategory category,
            String notes,
            String linkedinUrl,
            String avatarUrl) {
    }

    public record Update(
            String firstName,
            String lastName,
            String email,
            String phone,
            String company,
            String role,
            Contact.ContactCategory category,
            String notes,
            String linkedinUrl,
            String avatarUrl) {
    }
}
