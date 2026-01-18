package com.rochanegra.api.user;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "profiles", schema = "public")
public class UserProfile {

    @Id
    @Column(name = "id")
    private UUID id; // This IS the userId (references auth.users)

    @Column(name = "email")
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "currency", length = 3)
    private String currency = "EUR";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
