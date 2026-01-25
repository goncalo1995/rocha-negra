package com.rochanegra.api.projects;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {
    // Find a specific member in a project
    Optional<ProjectMember> findByProjectIdAndUserId(UUID projectId, UUID userId);
}
