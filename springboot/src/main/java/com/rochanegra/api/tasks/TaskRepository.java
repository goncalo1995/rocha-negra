package com.rochanegra.api.tasks;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {
    // For getting tasks for a project
    List<Task> findByNodeIdOrderByPositionAsc(UUID nodeId);

    Optional<Task> findByIdAndCreatedBy(UUID taskId, UUID createdBy);

    // For getting personal "Inbox" tasks
    List<Task> findByNodeIdIsNullAndCreatedByOrderByCreatedAtDesc(UUID createdBy);

    // For getting active tasks
    List<Task> findByCreatedByAndStatusNotIn(UUID createdBy, List<TaskStatus> excludedStatuses);

    // For getting ALL tasks created by user (across nodes and inbox)
    List<Task> findAllByCreatedByOrderByCreatedAtDesc(UUID createdBy);

    boolean existsByParentIdAndStatusNot(UUID parentId, TaskStatus status);
}