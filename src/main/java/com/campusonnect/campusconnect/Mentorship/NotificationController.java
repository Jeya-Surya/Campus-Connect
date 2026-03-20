package com.campusonnect.campusconnect.Mentorship;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

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

    // 📊 Get unread notifications summary
    @GetMapping("/{userId}/unread-summary")
    public Map<String, Long> getUnreadSummary(@PathVariable Long userId) {
        Map<String, Long> summary = new HashMap<>();
        summary.put("request", notificationRepository.countByReceiverIdAndSeenFalseAndType(userId, "REQUEST"));
        summary.put("chat", notificationRepository.countByReceiverIdAndSeenFalseAndType(userId, "CHAT"));
        return summary;
    }

    // ✅ Mark notification as seen
    @PutMapping("/{notificationId}/seen")
    public void markAsSeen(@PathVariable Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setSeen(true);
        notificationRepository.save(n);
    }

    // ✅ Mark all notifications of a specific type as seen
    @PutMapping("/{userId}/seen-by-type")
    public void markAllByTypeSeen(
            @PathVariable Long userId,
            @RequestParam String type,
            @RequestParam(required = false) Long requestId) {

        String normalizedType = type == null ? "" : type.trim().toUpperCase(Locale.ROOT);
        List<Notification> list = requestId == null
                ? notificationRepository.findByReceiverIdAndSeenFalseAndType(userId, normalizedType)
                : notificationRepository.findByReceiverIdAndSeenFalseAndTypeAndRequestId(userId, normalizedType, requestId);

        for (Notification notification : list) {
            notification.setSeen(true);
        }
        notificationRepository.saveAll(list);
    }
}
