package com.campusonnect.campusconnect.StudyGroup;

import jakarta.persistence.*;

@Entity
@Table(name = "group_tasks")
public class GroupTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;
    private String taskDesc;
    private boolean isDone = false;

    // ================= GETTERS & SETTERS =================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getTaskDesc() { return taskDesc; }
    public void setTaskDesc(String taskDesc) { this.taskDesc = taskDesc; }
    public boolean isDone() { return isDone; }
    public void setDone(boolean done) { isDone = done; }
}