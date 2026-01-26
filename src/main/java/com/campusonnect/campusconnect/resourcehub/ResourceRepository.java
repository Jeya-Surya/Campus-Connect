package com.campusonnect.campusconnect.resourcehub;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByStatus(String status);

    boolean existsByFileHash(String fileHash);

    // ✅ SIMPLE & SAFE SEARCH
    List<Resource> findByStatusAndSubjectContainingIgnoreCaseAndSemester(
            String status,
            String subject,
            Integer semester
    );
}
