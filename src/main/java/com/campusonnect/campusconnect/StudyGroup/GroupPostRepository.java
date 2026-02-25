package com.campusonnect.campusconnect.StudyGroup;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface GroupPostRepository extends JpaRepository<GroupPost, Long> {
    List<GroupPost> findByGroupIdOrderByPostedAtDesc(Long groupId);

    @Transactional
    void deleteByGroupId(Long groupId);
}