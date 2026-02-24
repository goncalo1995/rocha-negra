package com.rochanegra.api.modules.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserDataDto> getMyProfile(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userProfileService.getUserData(userId));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileDto> updateMyProfile(Authentication authentication,
            @Valid @RequestBody UserProfileUpdateDto updateDto) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userProfileService.updateProfile(userId, updateDto));
    }
}
