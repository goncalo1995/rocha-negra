package com.rochanegra.api.modules.roadmap.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.rochanegra.api.modules.roadmap.domain.ProjectDetails;
import java.util.UUID;

@Repository
public interface ProjectDetailsRepository extends JpaRepository<ProjectDetails, UUID> {
}
