package com.campusonnect.campusconnect.Mentorship;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/alumni")
@CrossOrigin("*")
public class AlumniController {

    @Autowired
    private AlumniRepository alumniRepository;

    // ✅ CREATE ALUMNI PROFILE
    @PostMapping
    public Alumni createAlumni(@RequestBody Alumni alumni) {

        if (alumni.getUserId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "userId is required");
        }

        return alumniRepository.save(alumni);
    }

    // ✅ GET ALUMNI BY USER ID (USED BY mentorship.html)
    @GetMapping("/user/{userId}")
    public Alumni getByUserId(@PathVariable Long userId) {
        return alumniRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Alumni not found for userId " + userId
                        ));
    }

    // ✅ (OPTIONAL BUT USEFUL) LIST ALL ALUMNI
    @GetMapping
    public List<Alumni> listAll() {
        return alumniRepository.findAll();
    }
}
