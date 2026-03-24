package com.campusonnect.campusconnect.StudyGroup;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupId(Long groupId);
    boolean existsByGroupIdAndUserEmail(Long groupId, String userEmail);

    @Transactional
    void deleteByGroupId(Long groupId);

    @Transactional
    void deleteByGroupIdAndUserEmail(Long groupId, String userEmail);
}