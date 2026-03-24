package com.campusonnect.campusconnect.ProjectCompass;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {

    // 1. Find by Project ID
    List<ProjectApplication> findByProjectId(Long projectId);

    // 2. THE FIX: Ignore Case (LOWER) so notifications always work
    @Query("SELECT a FROM ProjectApplication a JOIN ProjectCompass p ON a.projectId = p.id WHERE LOWER(p.createdBy) = LOWER(:ownerEmail) AND a.status = 'PENDING'")
    List<ProjectApplication> findPendingRequestsForOwner(@Param("ownerEmail") String ownerEmail);

    // 3. Find Accepted Members
    List<ProjectApplication> findByProjectIdAndStatus(Long projectId, String status);

    // 4. Delete applications
    void deleteByProjectId(Long projectId);
}