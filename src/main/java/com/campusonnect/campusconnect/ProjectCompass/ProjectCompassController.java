package com.campusonnect.campusconnect.ProjectCompass;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/project-compass")
@CrossOrigin
public class ProjectCompassController {

    private final ProjectCompassService projectService;
    private final ProjectApplicationService appService;
    private final ProjectApplicationRepository appRepo;

    public ProjectCompassController(ProjectCompassService projectService, ProjectApplicationService appService, ProjectApplicationRepository appRepo) {
        this.projectService = projectService;
        this.appService = appService;
        this.appRepo = appRepo;
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectCompass project) {
        if (project.getCreatedBy() == null || project.getCreatedBy().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: User email is missing.");
        }
        return ResponseEntity.ok(projectService.create(project));
    }

    @GetMapping
    public List<ProjectCompass> getProjects() {
        return projectService.getAll();
    }

    // --- SECURE DELETE ENDPOINT ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, @RequestParam String email) {
        try {
            // Service will throw RuntimeException if emails don't match
            projectService.deleteProject(id, email);
            return ResponseEntity.ok("Project deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body("Unauthorized: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/members")
    public List<ProjectApplication> getProjectMembers(@PathVariable Long id) {
        return appRepo.findByProjectIdAndStatus(id, "ACCEPTED");
    }

    @PostMapping("/apply")
    public ProjectApplication apply(@RequestBody ProjectApplication application) {
        return appService.apply(application);
    }

    @GetMapping("/requests")
    public List<ProjectApplication> getMyRequests(@RequestParam String email) {
        // This returns ONLY requests for projects owned by 'email'
        return appService.getPendingRequestsForOwner(email);
    }

    @PutMapping("/requests/{id}/status")
    public ProjectApplication updateStatus(@PathVariable Long id, @RequestParam String status) {
        return appService.updateStatus(id, status);
    }
}