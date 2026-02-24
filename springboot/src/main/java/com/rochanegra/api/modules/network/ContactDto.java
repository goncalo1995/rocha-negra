package com.rochanegra.api.modules.network;

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

        public static Detail fromEntity(Contact contact) {
                return new Detail(
                                contact.getId(),
                                contact.getFirstName(),
                                contact.getLastName(),
                                contact.getEmail(),
                                contact.getPhone(),
                                contact.getCompany(),
                                contact.getRole(),
                                contact.getCategory(),
                                contact.getNotes(),
                                contact.getLinkedinUrl(),
                                contact.getAvatarUrl(),
                                contact.getCreatedAt());
        }

}
