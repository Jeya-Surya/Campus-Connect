package com.campusonnect.campusconnect.Mentorship;

import com.campusonnect.campusconnect.model.User;
import com.campusonnect.campusconnect.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatSocketController {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MentorshipRequestRepository mentorshipRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @MessageMapping("/chat.send/{mentorshipId}")
    @SendTo("/topic/chat/{mentorshipId}")
    public ChatMessage sendMessage(
            @DestinationVariable Long mentorshipId,
            ChatMessage message) {

        MentorshipRequest request = mentorshipRequestRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship request not found"));

        User sender = userRepository.findById(message.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Long receiverId = resolveReceiverId(request, sender.getId());

        message.setMentorshipRequestId(mentorshipId);
        message.setSenderName(sender.getName());
        message.setReceiverId(receiverId);
        message.setCreatedAt(LocalDateTime.now());

        ChatMessage saved = chatRepository.save(message);

        Notification notification = new Notification();
        notification.setReceiverId(receiverId);
        notification.setMessage("New message from " + sender.getName());
        notification.setType("CHAT");
        notification.setRequestId(mentorshipId);
        notificationRepository.save(notification);

        return saved;
    }

    private Long resolveReceiverId(MentorshipRequest request, Long senderId) {
        if (senderId.equals(request.getAlumni().getUserId())) {
            User student = userRepository.findByEmail(request.getStudentEmail())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            return student.getId();
        }
        return request.getAlumni().getUserId();
    }
}
