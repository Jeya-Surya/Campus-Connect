package com.campusonnect.campusconnect.Mentorship;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage>
    findByMentorshipRequestIdOrderByCreatedAtAsc(Long mentorshipRequestId);
}
