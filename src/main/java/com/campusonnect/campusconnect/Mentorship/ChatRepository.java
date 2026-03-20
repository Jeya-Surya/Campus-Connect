package com.campusonnect.campusconnect.Mentorship;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage>
    findByMentorshipRequestIdOrderByCreatedAtAsc(Long mentorshipRequestId);

    ChatMessage findTopByMentorshipRequestIdOrderByCreatedAtDesc(Long mentorshipRequestId);

    @Query("""
            SELECT c FROM ChatMessage c
            WHERE c.mentorshipRequestId IN :requestIds
              AND c.createdAt = (
                SELECT MAX(c2.createdAt)
                FROM ChatMessage c2
                WHERE c2.mentorshipRequestId = c.mentorshipRequestId
              )
            """)
    List<ChatMessage> findLatestByRequestIds(@Param("requestIds") List<Long> requestIds);
}
