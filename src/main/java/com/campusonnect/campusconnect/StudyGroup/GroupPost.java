package com.campusonnect.campusconnect.StudyGroup;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_posts")
public class GroupPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;
    private String authorEmail;
    private String authorName;

    @Column(length = 2000)
    private String content; // The message or code snippet

    private LocalDateTime postedAt = LocalDateTime.now();

    // --- NEW: For Image/File Uploads ---
    private String fileUrl;

    // --- NEW: For Message Replies ---
    private Long replyToId;
    private String replyToAuthor;
    @Column(length = 500)
    private String replyToContent;

    // ================= GETTERS & SETTERS =================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public Long getReplyToId() { return replyToId; }
    public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }
    public String getReplyToAuthor() { return replyToAuthor; }
    public void setReplyToAuthor(String replyToAuthor) { this.replyToAuthor = replyToAuthor; }
    public String getReplyToContent() { return replyToContent; }
    public void setReplyToContent(String replyToContent) { this.replyToContent = replyToContent; }
}