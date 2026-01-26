package com.campusonnect.campusconnect.Mentorship;

import com.campusonnect.campusconnect.model.User;
import com.campusonnect.campusconnect.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlumniService {

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Alumni> getAllAlumni() {
        return alumniRepository.findAll();
    }

    public Alumni addAlumni(Alumni alumni) {

        // 🔑 FIND USER BY EMAIL
        User user = userRepository.findByEmail(alumni.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found for alumni"));

        // 🔑 LINK USERS TABLE
        alumni.setUserId(user.getId());

        return alumniRepository.save(alumni);
    }
}
