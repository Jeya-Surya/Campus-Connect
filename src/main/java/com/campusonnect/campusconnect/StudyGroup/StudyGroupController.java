package com.campusonnect.campusconnect.StudyGroup;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/api/study-groups")
@CrossOrigin
public class StudyGroupController {

    public static String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/groups/";
    private final StudyGroupService service;

    public StudyGroupController(StudyGroupService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StudyGroup> createGroup(@RequestBody StudyGroup group) {
        return ResponseEntity.ok(service.createGroup(group));
    }

    @GetMapping
    public ResponseEntity<List<StudyGroup>> getAllGroups() {
        return ResponseEntity.ok(service.getAllGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyGroup> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(service.getGroupById(id));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinGroup(@PathVariable Long id, @RequestBody GroupMember member) {
        member.setGroupId(id);
        try {
            return ResponseEntity.ok(service.joinGroup(member));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMember>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(service.getGroupMembers(id));
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<GroupPost> createPost(
            @PathVariable Long id,
            @RequestParam("authorEmail") String authorEmail,
            @RequestParam("authorName") String authorName,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "replyToId", required = false) Long replyToId,
            @RequestParam(value = "replyToAuthor", required = false) String replyToAuthor,
            @RequestParam(value = "replyToContent", required = false) String replyToContent,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        GroupPost post = new GroupPost();
        post.setGroupId(id);
        post.setAuthorEmail(authorEmail);
        post.setAuthorName(authorName);
        post.setContent(content);
        post.setReplyToId(replyToId);
        post.setReplyToAuthor(replyToAuthor);
        post.setReplyToContent(replyToContent);

        // Handle Image Upload
        if (file != null && !file.isEmpty()) {
            try {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) dir.mkdirs();
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR, fileName);
                Files.write(filePath, file.getBytes());
                post.setFileUrl("/uploads/groups/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().build();
            }
        }
        return ResponseEntity.ok(service.createPost(post));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<GroupPost>> getPosts(@PathVariable Long id) {
        return ResponseEntity.ok(service.getGroupPosts(id));
    }

    // --- NEW: API ENDPOINTS FOR LEAVE/DELETE ---

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id, @RequestParam String email) {
        try {
            service.deleteGroup(id, email);
            return ResponseEntity.ok("Group deleted.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/members")
    public ResponseEntity<?> leaveGroup(@PathVariable Long id, @RequestParam String email) {
        try {
            service.leaveGroup(id, email);
            return ResponseEntity.ok("Left group.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NEW: API ENDPOINT TO DELETE POST ---
    @DeleteMapping("/{groupId}/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long groupId, @PathVariable Long postId, @RequestParam String email) {
        try {
            service.deletePost(groupId, postId, email);
            return ResponseEntity.ok("Post deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<GroupTask> addTask(@PathVariable Long id, @RequestBody GroupTask task) {
        task.setGroupId(id);
        return ResponseEntity.ok(service.addTask(task));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<GroupTask>> getTasks(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTasks(id));
    }

    @PutMapping("/tasks/{taskId}/toggle")
    public ResponseEntity<GroupTask> toggleTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.toggleTask(taskId));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        service.deleteTask(taskId);
        return ResponseEntity.ok().build();
    }
}