package com.campusonnect.campusconnect.resourcehub;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByStatus(String status);

    List<Resource> findByStatusOrderByIdDesc(String status);

    boolean existsByFileHash(String fileHash);

    // ✅ SIMPLE & SAFE SEARCH
    List<Resource> findByStatusAndSubjectContainingIgnoreCaseAndSemester(
            String status,
            String subject,
            Integer semester
    );

    @Query("""
            SELECT r FROM Resource r
            WHERE r.status = :status
              AND (:type IS NULL OR r.resourceType = :type)
              AND (:subject IS NULL OR LOWER(r.subject) LIKE LOWER(CONCAT('%', :subject, '%')))
              AND (:college IS NULL OR LOWER(r.college) LIKE LOWER(CONCAT('%', :college, '%')))
              AND (:semester IS NULL OR r.semester = :semester)
            ORDER BY r.id DESC
            """)
    List<Resource> searchApproved(
            @Param("status") String status,
            @Param("type") String type,
            @Param("subject") String subject,
            @Param("college") String college,
            @Param("semester") Integer semester
    );
}
