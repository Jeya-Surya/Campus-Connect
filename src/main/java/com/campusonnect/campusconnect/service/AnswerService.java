package com.campusonnect.campusconnect.service;

import com.campusonnect.campusconnect.model.Answer;
import com.campusonnect.campusconnect.model.Doubt;
import com.campusonnect.campusconnect.repo.AnswerRepository;
import com.campusonnect.campusconnect.repo.DoubtRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final DoubtRepository doubtRepository;

    public AnswerService(AnswerRepository answerRepository, DoubtRepository doubtRepository) {
        this.answerRepository = answerRepository;
        this.doubtRepository = doubtRepository;
    }

    // ✅ Add a new answer to a doubt
    public Answer addAnswer(Long doubtId, Answer answer) {
        Optional<Doubt> doubtOpt = doubtRepository.findById(doubtId);
        if (doubtOpt.isEmpty()) {
            throw new RuntimeException("Doubt not found with id: " + doubtId);
        }

        Doubt doubt = doubtOpt.get();
        answer.setDoubt(doubt);  // link answer to doubt
        return answerRepository.save(answer);
    }

    // ✅ Get all answers for a specific doubt
    public List<Answer> getAnswersByDoubtId(Long doubtId) {
        return answerRepository.findByDoubtId(doubtId);
    }
}
