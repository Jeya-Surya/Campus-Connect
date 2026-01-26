package com.campusonnect.campusconnect.Mentorship;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByReceiverId(Long receiverId);
    List<Notification> findByReceiverIdAndSeenFalse(Long receiverId);

}
