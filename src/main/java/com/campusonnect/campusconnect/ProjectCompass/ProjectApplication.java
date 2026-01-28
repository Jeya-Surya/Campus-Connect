package com.campusonnect.campusconnect.ProjectCompass;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_application")
public class ProjectApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private String applicantEmail;

    // NEW FIELD: Store the joiner's name
    private String applicantName;

    @Column(length = 1000)
    private String skillProof;

    private String status; // PENDING, ACCEPTED, REJECTED

    private LocalDateTime appliedAt = LocalDateTime.now();

    // ================= GETTERS & SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getSkillProof() { return skillProof; }
    public void setSkillProof(String skillProof) { this.skillProof = skillProof; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}