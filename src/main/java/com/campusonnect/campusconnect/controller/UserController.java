package com.campusonnect.campusconnect.controller;

import com.campusonnect.campusconnect.model.User;
import com.campusonnect.campusconnect.repo.UserRepository;
import com.campusonnect.campusconnect.service.UserService;
import com.campusonnect.campusconnect.util.PasswordUtil; // ADDED
import jakarta.servlet.http.HttpServletRequest; // ADDED
import jakarta.servlet.http.HttpServletResponse; // ADDED
import jakarta.servlet.http.HttpSession; // ADDED
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException; // ADDED
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

        String hashedPassword = PasswordUtil.hashPassword(user.getPassword()); // ADDED
        user.setPassword(hashedPassword); // MODIFIED

        return ResponseEntity.ok(repo.save(user));
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) { // MODIFIED

        Optional<User> existing = repo.findByEmail(user.getEmail());

        if (existing.isPresent() &&
                PasswordUtil.verifyPassword(user.getPassword(), existing.get().getPassword())) {

            request.getSession().invalidate(); // ADDED
            HttpSession session = request.getSession(true); // ADDED
            session.setAttribute("user", existing.get().getEmail()); // ADDED
            session.setAttribute("role", existing.get().getRole()); // ADDED
            session.setMaxInactiveInterval(15 * 60); // ADDED

            return ResponseEntity.ok(existing.get());
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }


    @PutMapping("/users/{id}/role")
    public User updateUserRole(
            @PathVariable Long id,
            @RequestParam String role,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException { // MODIFIED

        HttpSession session = request.getSession(false); // ADDED
        if (session != null) { // ADDED
            String roleFromSession = (String) session.getAttribute("role"); // ADDED
            if (roleFromSession != null && !roleFromSession.equals("admin")) { // ADDED
                response.sendRedirect("unauthorized.jsp"); // ADDED
                return null; // ADDED
            } // ADDED
        } // ADDED

        return userService.updateRole(id, role);
    }
}