package com.campusonnect.campusconnect.Mentorship;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorshipChatRepository
        extends JpaRepository<MentorshipChat, Long> {

    List<MentorshipChat> findByRequestIdOrderBySentAtAsc(Long requestId);
}
