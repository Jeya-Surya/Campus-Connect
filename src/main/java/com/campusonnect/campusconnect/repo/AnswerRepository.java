package com.campusonnect.campusconnect.repo;

import com.campusonnect.campusconnect.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByDoubtId(Long doubtId);
}
