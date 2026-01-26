package com.campusonnect.campusconnect.Mentorship;

import com.campusonnect.campusconnect.model.User;
import com.campusonnect.campusconnect.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MentorshipRequestService {

    @Autowired
    private MentorshipRequestRepository mentorshipRequestRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // ================= STUDENT SENDS REQUEST =================
    @Autowired
    private AlumniRepository alumniRepository;

    public MentorshipRequest sendRequest(
            Long alumniUserId,
            String studentName,
            String studentEmail,
            String message,
            String category) {

        // validate student
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // find alumni PROFILE using user_id
        Alumni alumni = alumniRepository.findByUserId(alumniUserId)
                .orElseThrow(() -> new RuntimeException("Alumni profile not found"));

        MentorshipRequest req = new MentorshipRequest();
        req.setStudentName(studentName);
        req.setStudentEmail(studentEmail);
        req.setMessage(message);
        req.setCategory(category);
        req.setStatus(RequestStatus.PENDING);
        req.setRequestDate(LocalDate.now());
        req.setAlumni(alumni);

        MentorshipRequest saved = mentorshipRequestRepository.save(req);

        // notify alumni
        Notification n1 = new Notification();
        n1.setReceiverId(alumniUserId);
        n1.setMessage("You received a new mentorship request from " + studentName);
        notificationRepository.save(n1);

        // notify student
        Notification n2 = new Notification();
        n2.setReceiverId(student.getId());
        n2.setMessage("Your mentorship request was sent successfully");
        notificationRepository.save(n2);

        return saved;
    }
    // ✅ ALUMNI VIEW REQUESTS
    public List<MentorshipRequest> getRequestsForAlumni(Long alumniUserId) {
        return mentorshipRequestRepository.findByAlumni_UserId(alumniUserId);
    }
    // ✅ STUDENT VIEW REQUESTS
    public List<MentorshipRequest> getRequestsForStudent(String studentEmail) {
        return mentorshipRequestRepository.findByStudentEmail(studentEmail);
    }
    // ================= UPDATE REQUEST STATUS (ALUMNI) =================
    public MentorshipRequest updateRequestStatus(Long requestId, String status) {

        MentorshipRequest req = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        RequestStatus newStatus;
        try {
            newStatus = RequestStatus.valueOf(status.trim().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid status value");
        }

        req.setStatus(newStatus);
        MentorshipRequest saved = mentorshipRequestRepository.save(req);

        // 🔔 notify student
        User student = userRepository.findByEmail(req.getStudentEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Notification notif = new Notification();
        notif.setReceiverId(student.getId());
        notif.setMessage("Your mentorship request was " + newStatus.name().toLowerCase());
        notificationRepository.save(notif);

        return saved;
    }


}
