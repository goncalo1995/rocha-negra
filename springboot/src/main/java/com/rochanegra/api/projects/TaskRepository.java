package com.rochanegra.api.projects;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {
    // For getting tasks for a project
    List<Task> findByProjectIdOrderByPositionAsc(UUID projectId);

    // For getting personal "Inbox" tasks
    List<Task> findByProjectIdIsNullAndCreatedByOrderByCreatedAtDesc(UUID createdBy);

    // For getting ALL tasks created by user (across projects and inbox)
    List<Task> findAllByCreatedByOrderByCreatedAtDesc(UUID createdBy);

    boolean existsByParentIdAndStatusNot(UUID parentId, com.rochanegra.api.projects.types.TaskStatus status);
}