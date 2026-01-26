package com.campusonnect.campusconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusonnect.campusconnect.model.Answer;
import com.campusonnect.campusconnect.model.Doubt;
import com.campusonnect.campusconnect.repo.DoubtRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DoubtService {
    private DoubtRepository doubtRepo;

    public DoubtService(DoubtRepository doubtRepo){
        this.doubtRepo = doubtRepo;
    }

    public List<Doubt> getAllDoubts(){
        return doubtRepo.findAll();
    }

    public Optional<Doubt> getDoubtById(Long id){
        return doubtRepo.findById(id);
    }

    public Doubt createDoubt(Doubt d){
        return doubtRepo.save(d);
    }

    public Answer addAnswer(Long doubtId, Answer answer){
        Optional<Doubt> optionalDoubt = doubtRepo.findById(doubtId);
        if(optionalDoubt.isPresent()){
            Doubt doubt = optionalDoubt.get();
            doubt.addAnswer(answer);
            doubtRepo.save(doubt);
            return answer;
        }
        return null;
    }
}