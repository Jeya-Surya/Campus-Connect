package com.campusonnect.campusconnect.Mentorship;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // 🔔 Get all notifications
    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationRepository.findByReceiverId(userId);
    }

    // 🔔 Get only unread notifications (for count)
    @GetMapping("/{userId}/unread")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId) {
        return notificationRepository.findByReceiverIdAndSeenFalse(userId);
    }

    // ✅ Mark notification as seen
    @PutMapping("/{notificationId}/seen")
    public void markAsSeen(@PathVariable Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setSeen(true);
        notificationRepository.save(n);
    }
}
