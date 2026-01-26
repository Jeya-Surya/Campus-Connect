package com.campusonnect.campusconnect.controller;

import com.campusonnect.campusconnect.model.User;
import com.campusonnect.campusconnect.repo.UserRepository;
import com.campusonnect.campusconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository repo;
    @Autowired
    private UserService userService;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    // ---------------- REGISTER ----------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // 🔹 DEFAULT ROLE
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("STUDENT");
        }

        return ResponseEntity.ok(repo.save(user));
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        Optional<User> existing = repo.findByEmail(user.getEmail());

        if (existing.isPresent() &&
                existing.get().getPassword().equals(user.getPassword())) {

            return ResponseEntity.ok(existing.get());
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }


    @PutMapping("/users/{id}/role")
    public User updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {

        return userService.updateRole(id, role);
    }

}
