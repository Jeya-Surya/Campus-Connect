package com.campusonnect.campusconnect.Mentorship;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorshipRequestRepository
        extends JpaRepository<MentorshipRequest, Long> {

    // For alumni bell notifications
    List<MentorshipRequest> findByAlumni_UserId(Long userId);

    // For student dashboard
    List<MentorshipRequest> findByStudentEmail(String studentEmail);

    // Used by recent chat list to avoid showing non-chat-ready requests
    List<MentorshipRequest> findByAlumni_UserIdAndStatus(Long userId, RequestStatus status);
    List<MentorshipRequest> findByStudentEmailAndStatus(String studentEmail, RequestStatus status);
}
