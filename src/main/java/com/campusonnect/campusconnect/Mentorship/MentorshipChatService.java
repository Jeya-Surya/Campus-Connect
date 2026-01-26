package com.campusonnect.campusconnect.Mentorship;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MentorshipChatService {

    @Autowired
    private MentorshipChatRepository chatRepository;

    @Autowired
    private MentorshipRequestRepository requestRepository;

    // 🔹 Load chat messages for a mentorship request
    public List<MentorshipChat> getChatByRequestId(Long requestId) {

        // 🔐 Ensure request exists
        MentorshipRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Mentorship request not found"));

        // ✅ Only ACCEPTED requests can chat
        if (req.getStatus() != RequestStatus.ACCEPTED) {
            throw new RuntimeException("Chat allowed only for accepted requests");
        }

        return chatRepository.findByRequestIdOrderBySentAtAsc(requestId);
    }

    // 🔹 Send message
    public MentorshipChat sendMessage(MentorshipChat chat) {

        // 🔐 Validate request
        MentorshipRequest req = requestRepository.findById(chat.getRequestId())
                .orElseThrow(() -> new RuntimeException("Mentorship request not found"));

        if (req.getStatus() != RequestStatus.ACCEPTED) {
            throw new RuntimeException("Cannot send message. Request not accepted.");
        }

        return chatRepository.save(chat);
    }
}
