package com.campusonnect.campusconnect.ProjectCompass;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_compass")
public class ProjectCompass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectTitle;

    @Column(length = 2000)
    private String projectDescription;

    private String requiredSkills;

    private String createdBy; // student email

    // NEW FIELD: Store the owner's actual name
    private String ownerName;

    @Column(length = 1000)
    private String projectRoles;

    private String status; // OPEN, IN_PROGRESS, CLOSED

    private LocalDateTime createdAt = LocalDateTime.now();

    // ================= GETTERS & SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getProjectRoles() { return projectRoles; }
    public void setProjectRoles(String projectRoles) { this.projectRoles = projectRoles; }
}