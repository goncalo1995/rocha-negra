package com.rochanegra.api.modules.user;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import com.rochanegra.api.common.exception.ResourceNotFoundException;
import com.rochanegra.api.modules.preferences.UserPreferencesService;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserPreferencesService userPreferencesService;

    public UserDataDto getUserData(UUID userId) {
        // Fetch the user's profile
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user"));

        // Fetch the user's preferences
        Map<String, Object> preferences = userPreferencesService.getAllPreferences(userId);

        // Map the profile entity to a DTO
        UserProfileDto profileDto = new UserProfileDto(
                profile.getId(),
                profile.getEmail(),
                profile.getFullName(),
                profile.getAvatarUrl(),
                profile.getCreatedAt());

        // Return the combined DTO
        return new UserDataDto(profileDto, preferences);
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
        profile.setEmail(userId.toString() + "@placeholder.com");
        return userProfileRepository.save(profile);
    }

    private UserProfileDto toDto(UserProfile profile) {
        return new UserProfileDto(
                profile.getId(),
                profile.getEmail(),
                profile.getFullName(),
                profile.getAvatarUrl(),
                profile.getCreatedAt());
    }
}
