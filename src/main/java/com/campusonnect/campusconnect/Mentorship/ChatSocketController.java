package com.campusonnect.campusconnect.Mentorship;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatSocketController {

    @Autowired
    private ChatRepository chatRepository;

    @MessageMapping("/chat.send/{mentorshipId}")
    @SendTo("/topic/chat/{mentorshipId}")
    public ChatMessage sendMessage(
            @DestinationVariable Long mentorshipId,
            ChatMessage message) {

        message.setMentorshipRequestId(mentorshipId);
        message.setCreatedAt(java.time.LocalDateTime.now());

        chatRepository.save(message);
        return message;
    }
}
