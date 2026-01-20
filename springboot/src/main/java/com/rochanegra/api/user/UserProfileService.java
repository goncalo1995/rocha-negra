package com.rochanegra.api.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileDto getProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseGet(() -> createDefaultProfile(userId));
        return toDto(profile);
    }

    public UserProfileDto updateProfile(UUID userId, UserProfileUpdateDto updateDto) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseGet(() -> createDefaultProfile(userId));

        if (updateDto.fullName() != null)
            profile.setFullName(updateDto.fullName());

        UserProfile savedProfile = userProfileRepository.save(profile);
        return toDto(savedProfile);
    }

    private UserProfile createDefaultProfile(UUID userId) {
        UserProfile profile = new UserProfile();
        profile.setId(userId);
        profile.setEmail(userId.toString() + "@placeholder.com"); // Unique placeholder
        return userProfileRepository.save(profile);
    }

    private UserProfileDto toDto(UserProfile profile) {
        return new UserProfileDto(
                profile.getId(),
                profile.getId(), // userId is same as id
                profile.getEmail(),
                profile.getFullName(),
                profile.getCreatedAt());
    }
}
