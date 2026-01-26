package com.campusonnect.campusconnect.controller;

import com.campusonnect.campusconnect.model.Answer;
import com.campusonnect.campusconnect.service.AnswerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doubts/{doubtId}/answers")
@CrossOrigin(origins = "*")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @PostMapping
    public ResponseEntity<Answer> addAnswer(
            @PathVariable Long doubtId,
            @RequestBody Answer answer
    ) {
        Answer savedAnswer = answerService.addAnswer(doubtId, answer);
        return ResponseEntity.ok(savedAnswer);
    }

    @GetMapping
    public ResponseEntity<List<Answer>> getAnswers(@PathVariable Long doubtId) {
        return ResponseEntity.ok(answerService.getAnswersByDoubtId(doubtId));
    }
}

