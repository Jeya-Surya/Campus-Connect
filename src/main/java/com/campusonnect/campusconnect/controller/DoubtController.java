package com.campusonnect.campusconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campusonnect.campusconnect.model.Doubt;
import com.campusonnect.campusconnect.service.DoubtService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/doubts")
@CrossOrigin(origins = "*")
public class DoubtController {

    private final DoubtService doubtService;

    public DoubtController(DoubtService doubtService) {
        this.doubtService = doubtService;
    }

    // ✅ Get all doubts
    @GetMapping
    public List<Doubt> getAllDoubts() {
        return doubtService.getAllDoubts();
    }

    // ✅ Create a new doubt
    @PostMapping
    public ResponseEntity<Doubt> createDoubt(@RequestBody Doubt doubt) {
        Doubt saved = doubtService.createDoubt(doubt);
        return ResponseEntity.created(URI.create("/api/doubts/" + saved.getId())).body(saved);
    }

    // ✅ Get a specific doubt by ID
    @GetMapping("/{id}")
    public ResponseEntity<Doubt> getDoubtById(@PathVariable Long id) {
        return doubtService.getDoubtById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
