package com.campusonnect.campusconnect.service;

import com.campusonnect.campusconnect.model.User;
import com.campusonnect.campusconnect.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 🔹 Update user role (STUDENT / ALUMNI)
    public User updateRole(Long userId, String role) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!role.equalsIgnoreCase("STUDENT") &&
                !role.equalsIgnoreCase("ALUMNI")) {
            throw new RuntimeException("Invalid role");
        }

        user.setRole(role.toUpperCase());
        return userRepository.save(user);
    }
}
