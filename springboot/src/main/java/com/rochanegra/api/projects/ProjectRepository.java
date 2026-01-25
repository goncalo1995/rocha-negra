package com.rochanegra.api.projects;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    // Custom query to find all projects a user is a member of
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.userId = :userId")
    List<Project> findProjectsByMember(@Param("userId") UUID userId);

    @Query("SELECT count(m) FROM ProjectMember m WHERE m.project.id = :projectId AND m.role = 'owner'")
    Long countOwners(@Param("projectId") UUID projectId);
}