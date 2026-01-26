package com.campusonnect.campusconnect.Mentorship;


import com.campusonnect.campusconnect.Mentorship.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlumniRepository extends JpaRepository<Alumni, Long> {
    Optional<Alumni> findByUserId(Long userId);

}

