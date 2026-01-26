package com.campusonnect.campusconnect.Mentorship;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mentorship")
@CrossOrigin
public class MentorshipRequestController {

    @Autowired
    private MentorshipRequestService service;

    // 📩 Student sends request
    @PostMapping("/send/{alumniUserId}")
    public MentorshipRequest sendRequest(
            @PathVariable Long alumniUserId,
            @RequestParam String studentName,
            @RequestParam String studentEmail,
            @RequestParam String message,
            @RequestParam String category) {

        return service.sendRequest(
                alumniUserId, studentName, studentEmail, message, category
        );
    }

    // 🔔 Alumni bell
    @GetMapping("/requests/{alumniUserId}")
    public List<MentorshipRequest> getRequestsForAlumni(
            @PathVariable Long alumniUserId) {

        return service.getRequestsForAlumni(alumniUserId);
    }

    // 👨‍🎓 Student history
    @GetMapping("/student/requests")
    public List<MentorshipRequest> getStudentRequests(
            @RequestParam String email) {

        return service.getRequestsForStudent(email);
    }

    // ✅ Accept / Reject (SIMPLE & SAFE)
    @PutMapping("/{requestId}/status")
    public MentorshipRequest updateStatus(
            @PathVariable Long requestId,
            @RequestParam String status) {

        return service.updateRequestStatus(requestId, status);
    }
}
