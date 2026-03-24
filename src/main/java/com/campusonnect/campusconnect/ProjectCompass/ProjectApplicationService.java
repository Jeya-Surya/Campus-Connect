package com.campusonnect.campusconnect.ProjectCompass;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectApplicationService {

    private final ProjectApplicationRepository repo;

    public ProjectApplicationService(ProjectApplicationRepository repo) {
        this.repo = repo;
    }

    // 1. Student Applies
    public ProjectApplication apply(ProjectApplication application) {
        application.setStatus("PENDING");
        if (application.getAppliedAt() == null) {
            application.setAppliedAt(LocalDateTime.now());
        }
        return repo.save(application);
    }

    // 2. Owner checks Notifications (The Fix)
    public List<ProjectApplication> getPendingRequestsForOwner(String ownerEmail) {
        return repo.findPendingRequestsForOwner(ownerEmail);
    }

    // 3. Owner updates status
    public ProjectApplication updateStatus(Long applicationId, String status) {
        ProjectApplication app = repo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus(status);
        return repo.save(app);
    }
}