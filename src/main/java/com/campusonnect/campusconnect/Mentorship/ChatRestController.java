package com.campusonnect.campusconnect.Mentorship;

import com.campusonnect.campusconnect.model.User;
import com.campusonnect.campusconnect.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin // IMPORTANT for frontend
public class ChatRestController {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/mentorship/";

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MentorshipRequestRepository mentorshipRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AlumniRepository alumniRepository;

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

    @PostMapping("/{mentorshipRequestId}/upload")
    public ChatMessage uploadMessageWithFile(
            @PathVariable Long mentorshipRequestId,
            @RequestParam Long senderId,
            @RequestParam(required = false) String senderRole,
            @RequestParam(required = false) String message,
            @RequestParam(required = false) Long replyToId,
            @RequestParam(required = false) String replyToAuthor,
            @RequestParam(required = false) String replyToContent,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        MentorshipRequest request = mentorshipRequestRepository.findById(mentorshipRequestId)
                .orElseThrow(() -> new RuntimeException("Mentorship request not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        String storedFileName = System.currentTimeMillis() + "_" + StringUtils.cleanPath(
                Objects.requireNonNullElse(file.getOriginalFilename(), "attachment"));

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(storedFileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMentorshipRequestId(mentorshipRequestId);
        chatMessage.setSenderId(senderId);
        chatMessage.setSenderRole(senderRole);
        chatMessage.setSenderName(sender.getName());
        chatMessage.setReceiverId(resolveReceiverId(request, senderId));
        chatMessage.setMessage(message);
        chatMessage.setReplyToId(replyToId);
        chatMessage.setReplyToAuthor(replyToAuthor);
        chatMessage.setReplyToContent(replyToContent);
        chatMessage.setFileUrl("/uploads/mentorship/" + storedFileName);
        chatMessage.setFileName(file.getOriginalFilename());
        chatMessage.setCreatedAt(LocalDateTime.now());

        ChatMessage saved = chatRepository.save(chatMessage);

        notifyReceiver(saved.getReceiverId(), "New message from " + sender.getName(), "CHAT", mentorshipRequestId);
        messagingTemplate.convertAndSend("/topic/chat/" + mentorshipRequestId, saved);

        return saved;
    }

    @DeleteMapping("/message/{messageId}")
    public void deleteOwnMessage(@PathVariable Long messageId, @RequestParam Long userId) {
        ChatMessage message = chatRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!Objects.equals(message.getSenderId(), userId)) {
            throw new RuntimeException("Only sender can delete message");
        }

        Long requestId = message.getMentorshipRequestId();
        chatRepository.delete(message);

        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "DELETE");
        event.put("id", messageId);
        messagingTemplate.convertAndSend("/topic/chat/" + requestId, event);
    }

    @GetMapping("/recent")
    public List<RecentChatDto> getRecentChats(@RequestParam Long userId, @RequestParam(required = false) String role) {

        // Resolve role from DB profile to avoid wrong peer mapping from stale frontend role
        final String userRole = alumniRepository.findByUserId(userId).isPresent() ? "ALUMNI" : "STUDENT";

        List<MentorshipRequest> acceptedRequests;

        if ("ALUMNI".equals(userRole)) {
            acceptedRequests = mentorshipRequestRepository
                    .findByAlumni_UserIdAndStatus(userId, RequestStatus.ACCEPTED);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            acceptedRequests = mentorshipRequestRepository
                    .findByStudentEmailAndStatus(user.getEmail(), RequestStatus.ACCEPTED);
        }

        if (acceptedRequests.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> requestIds = acceptedRequests.stream()
                .map(MentorshipRequest::getId)
                .toList();

        Map<Long, ChatMessage> latestByRequest = chatRepository.findLatestByRequestIds(requestIds)
                .stream()
                .collect(Collectors.toMap(
                        ChatMessage::getMentorshipRequestId,
                        m -> m,
                        (a, b) -> a.getCreatedAt().isAfter(b.getCreatedAt()) ? a : b
                ));

        return acceptedRequests.stream()
                .map(req -> {
                    ChatMessage latest = latestByRequest.get(req.getId());
                    String peerName = "ALUMNI".equals(userRole)
                            ? req.getStudentName()
                            : req.getAlumni().getName();

                    String preview = "Start your mentorship chat";
                    if (latest != null) {
                        if (latest.getMessage() != null && !latest.getMessage().isBlank()) {
                            preview = latest.getMessage();
                        } else if (latest.getFileUrl() != null && !latest.getFileUrl().isBlank()) {
                            preview = "Sent an attachment";
                        }
                    }

                    LocalDateTime timestamp = latest != null ? latest.getCreatedAt() : null;

                    return new RecentChatDto(req.getId(), peerName, preview, timestamp);
                })
                .sorted(Comparator.comparing(
                        (RecentChatDto dto) -> dto.lastMessageAt() == null ? LocalDateTime.MIN : dto.lastMessageAt()
                ).reversed())
                .toList();
    }

    private Long resolveReceiverId(MentorshipRequest request, Long senderId) {
        if (senderId.equals(request.getAlumni().getUserId())) {
            User student = userRepository.findByEmail(request.getStudentEmail())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            return student.getId();
        }
        return request.getAlumni().getUserId();
    }

    private void notifyReceiver(Long receiverId, String text, String type, Long requestId) {
        Notification notification = new Notification();
        notification.setReceiverId(receiverId);
        notification.setMessage(text);
        notification.setType(type);
        notification.setRequestId(requestId);
        notificationRepository.save(notification);
    }

    public record RecentChatDto(
            Long requestId,
            String peerName,
            String lastMessage,
            LocalDateTime lastMessageAt
    ) {}
}
