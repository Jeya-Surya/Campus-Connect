package com.campusonnect.campusconnect.ProjectCompass;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class ProjectCompassService {

    private final ProjectCompassRepository repo;
    private final ProjectApplicationRepository appRepo;

    public ProjectCompassService(ProjectCompassRepository repo, ProjectApplicationRepository appRepo) {
        this.repo = repo;
        this.appRepo = appRepo;
    }

    public ProjectCompass create(ProjectCompass project) {
        if (project.getCreatedBy() == null || project.getCreatedBy().isEmpty()) {
            throw new IllegalArgumentException("Project owner is required");
        }
        project.setStatus("OPEN");
        project.setCreatedAt(LocalDateTime.now());
        return repo.save(project);
    }

    public List<ProjectCompass> getAll() {
        return repo.findAll();
    }

    // --- SECURE DELETE LOGIC ---
    @Transactional
    public void deleteProject(Long id, String requesterEmail) {
        ProjectCompass project = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // SECURITY CHECK: Does the project owner match the person asking to delete?
        // Note: We use trim() and equalsIgnoreCase() to be safe against formatting diffs
        if (!project.getCreatedBy().trim().equalsIgnoreCase(requesterEmail.trim())) {
            throw new RuntimeException("You are not the owner of this project.");
        }

        appRepo.deleteByProjectId(id);
        repo.deleteById(id);
    }
}