package com.campusonnect.campusconnect.Mentorship;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin // IMPORTANT for frontend
public class ChatRestController {

    @Autowired
    private ChatRepository chatRepository;

    @GetMapping("/{mentorshipRequestId}")
    public List<ChatMessage> getChatMessages(
            @PathVariable Long mentorshipRequestId) {

        System.out.println("Fetching chat for requestId = " + mentorshipRequestId);

        List<ChatMessage> messages =
                chatRepository.findByMentorshipRequestIdOrderByCreatedAtAsc(
                        mentorshipRequestId);

        System.out.println("Messages found = " + messages.size());

        return messages;
    }
}
