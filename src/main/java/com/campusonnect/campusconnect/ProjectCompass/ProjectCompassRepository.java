package com.campusonnect.campusconnect.ProjectCompass;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectCompassRepository extends JpaRepository<ProjectCompass, Long> {
    List<ProjectCompass> findByStatus(String status);
}
