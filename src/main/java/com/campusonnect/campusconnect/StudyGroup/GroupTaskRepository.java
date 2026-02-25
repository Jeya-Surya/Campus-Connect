package com.campusonnect.campusconnect.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface GroupTaskRepository extends JpaRepository<GroupTask, Long> {
    List<GroupTask> findByGroupId(Long groupId);

    @Transactional
    void deleteByGroupId(Long groupId);
}