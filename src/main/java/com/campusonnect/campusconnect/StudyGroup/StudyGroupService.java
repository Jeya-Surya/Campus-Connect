package com.campusonnect.campusconnect.StudyGroup;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class StudyGroupService {

    private final StudyGroupRepository groupRepo;
    private final GroupMemberRepository memberRepo;
    private final GroupPostRepository postRepo;
    private final GroupTaskRepository taskRepo;

    public StudyGroupService(StudyGroupRepository groupRepo, GroupMemberRepository memberRepo, GroupPostRepository postRepo, GroupTaskRepository taskRepo) {
        this.groupRepo = groupRepo;
        this.memberRepo = memberRepo;
        this.postRepo = postRepo;
        this.taskRepo = taskRepo; // NEW
    }

    public StudyGroup createGroup(StudyGroup group) {
        return groupRepo.save(group);
    }

    public List<StudyGroup> getAllGroups() {
        return groupRepo.findAll();
    }

    public StudyGroup getGroupById(Long id) {
        return groupRepo.findById(id).orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public GroupMember joinGroup(GroupMember member) {
        if (memberRepo.existsByGroupIdAndUserEmail(member.getGroupId(), member.getUserEmail())) {
            throw new RuntimeException("User is already in this group");
        }
        return memberRepo.save(member);
    }

    public List<GroupMember> getGroupMembers(Long groupId) {
        return memberRepo.findByGroupId(groupId);
    }

    public GroupPost createPost(GroupPost post) {
        return postRepo.save(post);
    }

    public List<GroupPost> getGroupPosts(Long groupId) {
        return postRepo.findByGroupIdOrderByPostedAtDesc(groupId);
    }

    // --- NEW: DELETE CLUB LOGIC ---
    @Transactional
    public void deleteGroup(Long groupId, String email) {
        StudyGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getCreatedBy().equalsIgnoreCase(email)) {
            throw new RuntimeException("Only the admin can delete this club.");
        }

        // Delete all posts and members first (foreign key cleanup), then the group
        postRepo.deleteByGroupId(groupId);
        memberRepo.deleteByGroupId(groupId);
        groupRepo.deleteById(groupId);
        taskRepo.deleteByGroupId(groupId);
    }

    // --- NEW: LEAVE CLUB LOGIC ---
    @Transactional
    public void leaveGroup(Long groupId, String email) {
        memberRepo.deleteByGroupIdAndUserEmail(groupId, email);
    }

    // --- NEW: DELETE POST LOGIC ---
    @Transactional
    public void deletePost(Long groupId, Long postId, String email) {
        GroupPost post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if the user is the author
        if (!post.getAuthorEmail().equalsIgnoreCase(email)) {
            // If not author, check if they are the Club Admin
            StudyGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            if (!group.getCreatedBy().equalsIgnoreCase(email)) {
                throw new RuntimeException("You are not authorized to delete this message.");
            }
        }

        postRepo.delete(post);
    }

    public GroupTask addTask(GroupTask task) {
        return taskRepo.save(task);
    }

    public List<GroupTask> getTasks(Long groupId) {
        return taskRepo.findByGroupId(groupId);
    }

    public GroupTask toggleTask(Long taskId) {
        GroupTask task = taskRepo.findById(taskId).orElseThrow();
        task.setDone(!task.isDone());
        return taskRepo.save(task);
    }

    public void deleteTask(Long taskId) {
        taskRepo.deleteById(taskId);
    }
}